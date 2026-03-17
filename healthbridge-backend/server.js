// @ts-nocheck
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Joi from "joi";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(express.json());

const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: CORS_ORIGIN }));

const PORT = process.env.PORT || 5001;

// In-memory stores (replace with DB later)
const approvals = new Map(); // key: patientId -> approval record
const pharmacyRequests = new Map(); // key: requestId -> pharmacy request
const patients = new Map(); // key: patientId -> patient record
const auditLogs = []; // in-memory audit log

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

function logAudit(action, detail) {
    auditLogs.unshift({
        id: id(),
        action,
        detail,
        createdAt: new Date().toISOString()
    });
    if (auditLogs.length > 200) auditLogs.pop();
}

// ---------------- ROUTES ----------------

// NEW: Patient registration
app.post("/api/patients/register", (req, res) => {
    const { error, value } = patientSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const patientId = id();
    const record = { patientId, ...value, registeredAt: new Date().toISOString() };

    patients.set(patientId, record);
    logAudit("patient_registered", `${record.name} (${patientId}) registered`);

    return res.status(201).json({
        message: "Patient registered successfully",
        patient: record
    });
});

// Optional: list all patients (for testing)
app.get("/api/patients", (req, res) => {
    res.json([...patients.values()]);
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

app.listen(PORT, () => {
    console.log(`HealthBridge backend listening on http://localhost:${PORT}`);
});
