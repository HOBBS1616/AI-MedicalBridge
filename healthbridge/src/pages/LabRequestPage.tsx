import { useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { addNotification } from "../lib/notifications";
import { logAudit } from "../lib/audit";
import { getJson, setJson } from "../lib/storage";

const STORAGE_KEY = "hb_lab_requests";

type LabRequest = {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    testType: string;
    priority: "routine" | "urgent";
    preferredDate: string;
    notes: string;
    status: "requested" | "approved" | "scheduled" | "completed";
    createdAt: string;
};

const testOptions = [
    "Complete blood count (CBC)",
    "Malaria rapid test",
    "Blood glucose",
    "Lipid profile",
    "Urinalysis",
    "Pregnancy test",
    "COVID-19 antigen",
    "Liver function panel",
    "Kidney function panel",
];

export default function LabRequestPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [testType, setTestType] = useState("");
    const [priority, setPriority] = useState<LabRequest["priority"]>("routine");
    const [preferredDate, setPreferredDate] = useState("");
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState("");

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setStatus("");
        const payload: LabRequest = {
            id: `lab_${Date.now()}`,
            name,
            email,
            phone,
            location,
            testType,
            priority,
            preferredDate,
            notes,
            status: "requested",
            createdAt: new Date().toISOString(),
        };

        const existing = getJson<LabRequest[]>(STORAGE_KEY, []);
        setJson(STORAGE_KEY, [payload, ...existing]);

        try {
            await fetch(`${API_BASE_URL}/api/lab-requests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            setStatus("Lab request submitted. A coordinator will confirm your slot.");
            addNotification({
                title: "Lab request received",
                body: "We will confirm your testing appointment shortly.",
                type: "success",
            });
            logAudit("lab_request_submitted", payload.name);
        } catch {
            setStatus("Saved locally. We will sync once the network is available.");
        }

        setName("");
        setEmail("");
        setPhone("");
        setLocation("");
        setTestType("");
        setPriority("routine");
        setPreferredDate("");
        setNotes("");
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div>
                <h1 className="text-3xl font-bold">Tests & Lab Requests</h1>
                <p className="mt-2 text-textSecondary">
                    Request at-home tests or schedule a partner lab visit. We will confirm availability and coverage.
                </p>
            </div>

            <form onSubmit={submit} className="mt-6 grid gap-4 rounded-lg border border-white/10 bg-secondary p-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Full name"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                        placeholder="Email address"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="Phone number"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                    <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        placeholder="City or home address"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <select
                        value={testType}
                        onChange={(e) => setTestType(e.target.value)}
                        required
                        className="rounded-md bg-primary border border-white/20 px-3 py-3 text-white"
                    >
                        <option value="">Select test type</option>
                        {testOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as LabRequest["priority"])}
                        className="rounded-md bg-primary border border-white/20 px-3 py-3 text-white"
                    >
                        <option value="routine">Routine</option>
                        <option value="urgent">Urgent</option>
                    </select>
                    <input
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        type="date"
                        required
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                    <input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Symptoms or special instructions (optional)"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                </div>

                {status && (
                    <div className="rounded-md border border-white/10 bg-primary px-4 py-3 text-sm">
                        {status}
                    </div>
                )}

                <button type="submit" className="virtua-button bg-faith text-black">
                    Submit lab request
                </button>
            </form>
        </div>
    );
}
