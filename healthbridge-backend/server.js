// @ts-nocheck
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Joi from "joi";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(express.json());

const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: CORS_ORIGIN }));

const PORT = process.env.PORT || 5001;
const DATA_PATH = path.join(__dirname, "data.json");

// In-memory stores (replace with DB later)
const approvals = new Map(); // key: patientId -> approval record
const pharmacyRequests = new Map(); // key: requestId -> pharmacy request
const patients = new Map(); // key: patientId -> patient record
const auditLogs = []; // in-memory audit log
const authCodes = new Map(); // email -> { email, code, expiresAt, name }
const sessions = new Map(); // token -> { email, name, role }
const errorLogs = [];
const subscriptions = [];

// Create mail transporter (uses Ethereal dev inbox if SMTP not configured)
async function createTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: false,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
    }
    try {
        const testAccount = await nodemailer.createTestAccount();
        const t = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: { user: testAccount.user, pass: testAccount.pass }
        });
        console.log("Ethereal test account created:", testAccount.user);
        return t;
    } catch (err) {
        console.warn("Email disabled: failed to create test account.", err?.message || err);
        return nodemailer.createTransport({ jsonTransport: true });
    }
}

const transporterPromise = createTransporter();

// Schemas
const approveSchema = Joi.object({
    patientId: Joi.string().required(),
    diagnosis: Joi.string().required(),
    icd_code: Joi.string().required(),
    suggested_medications: Joi.array()
        .items(Joi.object({ name: Joi.string().required(), dosage: Joi.string().required() }))
        .min(1)
        .required(),
    notes: Joi.string().allow("")
});

const pharmacyNotifySchema = Joi.object({
    patientId: Joi.string().required(),
    patientName: Joi.string().required(),
    location: Joi.string().required(),
    diagnosis: Joi.string().required(),
    medications: Joi.array()
        .items(Joi.object({ name: Joi.string().required(), dosage: Joi.string().required() }))
        .min(1)
        .required(),
    deliveryAddress: Joi.string().required(),
    doctor: Joi.string().required()
});

const pharmacyConfirmSchema = Joi.object({
    pharmacyId: Joi.string().required(),
    patientId: Joi.string().required(),
    status: Joi.string().valid("accepted", "rejected", "delivered").required(),
    deliveryETA: Joi.string().optional()
});

const authRequestSchema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().allow("").optional()
});

const authVerifySchema = Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().required(),
    name: Joi.string().allow("").optional()
});

const errorSchema = Joi.object({
    id: Joi.string().optional(),
    message: Joi.string().required(),
    stack: Joi.string().allow("").optional(),
    source: Joi.string().allow("").optional(),
    createdAt: Joi.string().optional()
});

const subscriptionSchema = Joi.object({
    email: Joi.string().email().required()
});

// NEW: Patient registration schema
const patientSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    age: Joi.number().integer().min(0).max(120).optional().empty(""),
    symptoms: Joi.string().required(),
    preferredTime: Joi.string().optional()
});

// Utilities
function id() {
    return Math.random().toString(36).slice(2);
}

let persistTimer = null;

async function loadState() {
    try {
        const raw = await fs.readFile(DATA_PATH, "utf-8");
        const data = JSON.parse(raw);
        (data.patients || []).forEach((record) => patients.set(record.patientId, record));
        (data.approvals || []).forEach((record) => approvals.set(record.patientId, record));
        (data.pharmacyRequests || []).forEach((record) => pharmacyRequests.set(record.requestId, record));
        (data.auditLogs || []).forEach((record) => auditLogs.push(record));
        (data.errorLogs || []).forEach((record) => errorLogs.push(record));
        (data.subscriptions || []).forEach((record) => subscriptions.push(record));
        (data.authCodes || []).forEach((record) => authCodes.set(record.email, record));
        console.log("Persisted backend data loaded.");
    } catch (err) {
        console.log("No persisted data found. Starting fresh.");
    }
}

async function persistState() {
    const data = {
        patients: [...patients.values()],
        approvals: [...approvals.values()],
        pharmacyRequests: [...pharmacyRequests.values()],
        auditLogs,
        errorLogs,
        subscriptions,
        authCodes: [...authCodes.values()],
    };
    try {
        await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
        console.warn("Failed to persist data:", err?.message || err);
    }
}

function schedulePersist() {
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
        persistState();
    }, 250);
}

function logAudit(action, detail) {
    auditLogs.unshift({
        id: id(),
        action,
        detail,
        createdAt: new Date().toISOString()
    });
    if (auditLogs.length > 200) auditLogs.pop();
    schedulePersist();
}

// ---------------- ROUTES ----------------
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// NEW: Patient registration
app.post("/api/patients/register", (req, res) => {
    const { error, value } = patientSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const patientId = id();
    const record = { patientId, ...value, registeredAt: new Date().toISOString() };

    patients.set(patientId, record);
    logAudit("patient_registered", `${record.name} (${patientId}) registered`);
    schedulePersist();

    return res.status(201).json({
        message: "Patient registered successfully",
        patient: record
    });
});

// Optional: list all patients (for testing)
app.get("/api/patients", (req, res) => {
    res.json([...patients.values()]);
});

// Auth: request email code
app.post("/api/auth/request-code", async (req, res) => {
    const { error, value } = authRequestSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const { email, name } = value;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    authCodes.set(email, { email, code, expiresAt, name });
    schedulePersist();

    const transporter = await transporterPromise;
    const toEmail = email;
    const subject = "Your HealthBridge sign-in code";
    const text = `Use this code to sign in: ${code}`;
    try {
        await transporter.sendMail({
            from: '"HealthBridge" <no-reply@healthbridge.local>',
            to: toEmail,
            subject,
            text
        });
        return res.json({ sent: true });
    } catch (err) {
        console.warn("Email failed, returning dev code.", err?.message || err);
        return res.json({ sent: false, code });
    }
});

app.post("/api/auth/verify-code", (req, res) => {
    const { error, value } = authVerifySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const { email, code, name } = value;
    const record = authCodes.get(email);
    if (!record || record.code !== code || record.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Invalid or expired code" });
    }
    authCodes.delete(email);
    const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
    const doctorEmails = (process.env.DOCTOR_EMAILS || "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
    const normalized = email.toLowerCase();
    const role = adminEmails.includes(normalized)
        ? "admin"
        : doctorEmails.includes(normalized)
            ? "doctor"
            : "patient";
    const token = id();
    sessions.set(token, { email, name: name || record.name || "Patient", role });
    schedulePersist();
    return res.json({
        token,
        user: { name: name || record.name || "Patient", email, role }
    });
});

app.get("/api/auth/me", (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.replace("Bearer ", "") : null;
    if (!token || !sessions.has(token)) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    return res.json({ user: sessions.get(token) });
});

// Doctor approves a prescription
app.post("/api/prescriptions/approve", async (req, res) => {
    const { error, value } = approveSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { patientId, diagnosis, icd_code, suggested_medications, notes } = value;
    const record = {
        approvalId: id(),
        patientId,
        diagnosis,
        icd_code,
        notes: notes || "",
        approvedBy: "Dr. Jane Doe", // TODO: from auth/user session
        approvedAt: new Date().toISOString(),
        final_medications: suggested_medications
    };

    approvals.set(patientId, record);
    logAudit("prescription_approved", `Prescription approved for patient ${patientId}`);
    schedulePersist();
    return res.json({
        status: "approved",
        ...record
    });
});

// Notify a pharmacy for delivery
app.post("/api/pharmacy/notify", async (req, res) => {
    const { error, value } = pharmacyNotifySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { patientId, patientName, location, diagnosis, medications, deliveryAddress, doctor } = value;

    // Ensure approval exists
    const approval = approvals.get(patientId);
    if (!approval) {
        return res.status(409).json({ error: "No approved prescription for this patient. Doctor must approve first." });
    }

    const requestId = id();
    const pharmacyId = "pharm-" + id();
    const expectedDelivery = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(); // +3h

    const request = {
        requestId,
        pharmacyId,
        patientId,
        patientName,
        location,
        diagnosis,
        medications,
        deliveryAddress,
        doctor,
        status: "sent",
        expectedDelivery
    };
    pharmacyRequests.set(requestId, request);
    logAudit("pharmacy_notified", `Pharmacy request ${requestId} created for patient ${patientId}`);
    schedulePersist();

    // Send email
    const transporter = await transporterPromise;
    const toEmail = process.env.PHARMACY_EMAIL || "pharmacy@example.com";
    const subject = `Prescription Delivery Request for ${patientName}`;
    const text = [
        `Patient: ${patientName} (ID: ${patientId})`,
        `Location: ${location}`,
        `Delivery address: ${deliveryAddress}`,
        `Doctor: ${doctor}`,
        `Diagnosis: ${diagnosis} (ICD: ${approval.icd_code})`,
        `Medications:`,
        ...medications.map((m) => ` - ${m.name} — ${m.dosage}`),
        ``,
        `Please confirm: POST /api/pharmacy/confirm`,
        `Body: {"pharmacyId":"${pharmacyId}","patientId":"${patientId}","status":"accepted","deliveryETA":"${expectedDelivery}"}`
    ].join("\n");

    const info = await transporter.sendMail({
        from: '"HealthBridge" <no-reply@healthbridge.local>',
        to: toEmail,
        subject,
        text
    });

    let previewUrl = undefined;
    if (nodemailer.getTestMessageUrl) {
        previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.log("Ethereal preview:", previewUrl);
    }

    return res.json({
        status: "sent",
        pharmacyId,
        expectedDelivery,
        requestId,
        emailPreview: previewUrl
    });
});

// Pharmacy confirms request
app.post("/api/pharmacy/confirm", async (req, res) => {
    const { error, value } = pharmacyConfirmSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { pharmacyId, patientId, status, deliveryETA } = value;

    // find request for this pharmacy+patient
    const found = [...pharmacyRequests.values()].find(
        (r) => r.pharmacyId === pharmacyId && r.patientId === patientId
    );
    if (!found) return res.status(404).json({ error: "No matching pharmacy request found." });

    found.status = status;
    if (deliveryETA) found.expectedDelivery = deliveryETA;
    logAudit("pharmacy_confirmed", `Pharmacy ${pharmacyId} ${status} for patient ${patientId}`);
    schedulePersist();

    return res.json({
        status: "confirmed",
        message:
            status === "accepted"
                ? `Pharmacy has accepted and will deliver by ${found.expectedDelivery}.`
                : status === "delivered"
                    ? "Order marked as delivered."
                    : "Order rejected.",
        request: found // ✅ no trailing comma here
    });
});

// Debug routes
app.get("/api/debug/approvals", (req, res) => {
    res.json([...approvals.values()]);
});

app.get("/api/debug/pharmacy-requests", (req, res) => {
    res.json([...pharmacyRequests.values()]);
});

app.get("/api/audit", (req, res) => {
    res.json(auditLogs);
});

app.post("/api/errors", (req, res) => {
    const { error, value } = errorSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    errorLogs.unshift({
        id: value.id || id(),
        message: value.message,
        stack: value.stack,
        source: value.source,
        createdAt: value.createdAt || new Date().toISOString()
    });
    if (errorLogs.length > 200) errorLogs.pop();
    schedulePersist();
    res.json({ status: "logged" });
});

app.get("/api/errors", (req, res) => {
    res.json(errorLogs);
});

app.post("/api/subscriptions", (req, res) => {
    const { error, value } = subscriptionSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const exists = subscriptions.find((item) => item.email === value.email);
    if (!exists) {
        subscriptions.unshift({ email: value.email, createdAt: new Date().toISOString() });
        if (subscriptions.length > 500) subscriptions.pop();
        schedulePersist();
    }
    res.json({ status: "subscribed" });
});

async function start() {
    await loadState();
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`HealthBridge backend listening on port ${PORT}`);
    });
}

start();
