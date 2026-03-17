import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { addNotification } from "../lib/notifications";
import { getCurrentUser } from "../lib/auth";
import { getJson, setJson } from "../lib/storage";

type Patient = {
    patientId: string;
    name: string;
    email: string;
    phone: string;
    symptoms: string;
};

type Medication = { name: string; dosage: string };

const DELIVERY_KEY = "hb_last_delivery";

export default function ClinicianPage() {
    const user = getCurrentUser();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedId, setSelectedId] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [icdCode, setIcdCode] = useState("");
    const [notes, setNotes] = useState("");
    const [location, setLocation] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [doctor, setDoctor] = useState(user?.name || "");
    const [medications, setMedications] = useState<Medication[]>([{ name: "", dosage: "" }]);
    const [status, setStatus] = useState("");

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/patients`)
            .then((res) => res.json())
            .then((data) => setPatients(data))
            .catch((err) => console.error("Error fetching patients:", err));
    }, []);

    const selected = useMemo(
        () => patients.find((p) => p.patientId === selectedId),
        [patients, selectedId]
    );

    const updateMedication = (index: number, field: keyof Medication, value: string) => {
        setMedications((prev) =>
            prev.map((med, idx) => (idx === index ? { ...med, [field]: value } : med))
        );
    };

    const addMedicationRow = () => {
        setMedications((prev) => [...prev, { name: "", dosage: "" }]);
    };

    const removeMedicationRow = (index: number) => {
        setMedications((prev) => prev.filter((_, idx) => idx !== index));
    };

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setStatus("");
        if (!selected) {
            setStatus("Please select a patient.");
            return;
        }
        const meds = medications.filter((m) => m.name && m.dosage);
        if (meds.length === 0) {
            setStatus("Add at least one medication.");
            return;
        }
        try {
            const approveRes = await fetch(`${API_BASE_URL}/api/prescriptions/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: selected.patientId,
                    diagnosis,
                    icd_code: icdCode,
                    suggested_medications: meds,
                    notes,
                }),
            });
            if (!approveRes.ok) {
                const err = await approveRes.json();
                throw new Error(err.error || "Failed to approve prescription");
            }

            const notifyRes = await fetch(`${API_BASE_URL}/api/pharmacy/notify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: selected.patientId,
                    patientName: selected.name,
                    location,
                    diagnosis,
                    medications: meds,
                    deliveryAddress,
                    doctor: doctor || "Clinician",
                }),
            });
            if (!notifyRes.ok) {
                const err = await notifyRes.json();
                throw new Error(err.error || "Failed to notify pharmacy");
            }
            const notifyData = await notifyRes.json();
            setJson(DELIVERY_KEY, notifyData);
            setStatus("Prescription approved and pharmacy notified.");
            addNotification({
                title: "Pharmacy notified",
                body: `Delivery request sent for ${selected.name}.`,
                type: "success",
            });
        } catch (err) {
            console.error(err);
            setStatus(err instanceof Error ? err.message : "Something went wrong.");
        }
    };

    if (user?.role !== "doctor" && user?.role !== "admin") {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold">Clinician Workflow</h1>
                <p className="mt-3 text-textSecondary">
                    This area is for clinicians and admins. Please sign in with the correct role.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Clinician Workflow</h1>
            <p className="mt-2 text-textSecondary">
                Approve prescriptions and notify partner pharmacies for delivery.
            </p>

            <form onSubmit={submit} className="mt-6 grid gap-4 rounded-lg border border-white/10 bg-secondary p-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <label className="text-sm text-textSecondary">Patient</label>
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            className="rounded-md bg-primary border border-white/20 px-3 py-2 text-white"
                            required
                        >
                            <option value="">Select patient</option>
                            {patients.map((p) => (
                                <option key={p.patientId} value={p.patientId}>
                                    {p.name} ({p.patientId})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm text-textSecondary">Doctor</label>
                        <input
                            value={doctor}
                            onChange={(e) => setDoctor(e.target.value)}
                            placeholder="Doctor name"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                    </div>
                    <input
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        required
                        placeholder="Diagnosis"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                    <input
                        value={icdCode}
                        onChange={(e) => setIcdCode(e.target.value)}
                        required
                        placeholder="ICD code"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                </div>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Clinical notes (optional)"
                    className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    rows={3}
                />
                <div className="grid gap-4 md:grid-cols-2">
                    <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        placeholder="Patient location"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                    <input
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                        placeholder="Delivery address"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                </div>

                <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Medications</h3>
                        <button
                            type="button"
                            onClick={addMedicationRow}
                            className="text-sm text-faith"
                        >
                            + Add medication
                        </button>
                    </div>
                    {medications.map((med, idx) => (
                        <div key={`${med.name}-${idx}`} className="grid gap-3 md:grid-cols-[1.2fr_1fr_auto]">
                            <input
                                value={med.name}
                                onChange={(e) => updateMedication(idx, "name", e.target.value)}
                                placeholder="Medication name"
                                className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                                required
                            />
                            <input
                                value={med.dosage}
                                onChange={(e) => updateMedication(idx, "dosage", e.target.value)}
                                placeholder="Dosage"
                                className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                                required
                            />
                            {medications.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeMedicationRow(idx)}
                                    className="rounded-md border border-white/20 px-3 py-2 text-xs text-textSecondary hover:bg-white/10"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {status && (
                    <div className="rounded-md border border-white/10 bg-primary px-4 py-3 text-sm">
                        {status}
                    </div>
                )}

                <button type="submit" className="virtua-button bg-faith text-black">
                    Approve & Notify Pharmacy
                </button>
            </form>

            {selected && (
                <div className="mt-6 rounded-lg border border-white/10 bg-secondary p-4 text-sm text-textSecondary">
                    Selected patient: {selected.name} • {selected.email} • {selected.phone}
                </div>
            )}
        </div>
    );
}
