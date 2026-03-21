import { useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { addNotification } from "../lib/notifications";
import { logAudit } from "../lib/audit";
import { getJson, setJson } from "../lib/storage";

type EmergencyRequest = {
    id: string;
    name: string;
    phone: string;
    location: string;
    urgency: string;
    symptoms: string;
    status: string;
    createdAt: string;
};

const KEY = "hb_emergency_requests";

export default function EmergencyRequestPage() {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        location: "",
        urgency: "high",
        symptoms: "",
    });
    const [status, setStatus] = useState("");
    const [requestId, setRequestId] = useState("");

    const updateField = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setStatus("");
        try {
            const res = await fetch(`${API_BASE_URL}/api/emergency-requests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Unable to submit request");
            const data = await res.json();
            setRequestId(data.request?.id || "");
            setStatus("Request submitted. Our dispatch team will reach you shortly.");
            addNotification({
                title: "Emergency request sent",
                body: "Stay safe. A dispatcher will call you shortly.",
                type: "info",
            });
            logAudit("emergency_request_sent", form.location);
        } catch (err) {
            const local: EmergencyRequest = {
                id: crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
                name: form.name,
                phone: form.phone,
                location: form.location,
                urgency: form.urgency,
                symptoms: form.symptoms,
                status: "pending",
                createdAt: new Date().toISOString(),
            };
            const list = getJson<EmergencyRequest[]>(KEY, []);
            list.unshift(local);
            setJson(KEY, list.slice(0, 200));
            setRequestId(local.id);
            setStatus("Saved locally. Please call your nearest emergency line if this is critical.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Emergency Request</h1>
            <p className="mt-2 text-textSecondary">
                Request an ambulance without leaving home. If this is life-threatening, call your emergency line now.
            </p>

            <form onSubmit={submit} className="mt-6 grid gap-4 rounded-lg border border-white/10 bg-secondary p-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <input
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        required
                        placeholder="Full name"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                    <input
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        required
                        placeholder="Phone number"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                </div>
                <input
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    required
                    placeholder="Your location (street, area, landmark)"
                    className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                />
                <div className="grid gap-4 md:grid-cols-2">
                    <select
                        value={form.urgency}
                        onChange={(e) => updateField("urgency", e.target.value)}
                        className="rounded-md bg-primary border border-white/20 px-3 py-2 text-white"
                    >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <input
                        value={form.symptoms}
                        onChange={(e) => updateField("symptoms", e.target.value)}
                        required
                        placeholder="Symptoms or reason"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                </div>
                <button type="submit" className="virtua-button bg-faith text-black">
                    Submit request
                </button>
                {status && (
                    <div className="rounded-md border border-white/10 bg-primary px-4 py-3 text-sm">
                        {status} {requestId && <div className="mt-1 text-xs text-textSecondary">Request ID: {requestId}</div>}
                    </div>
                )}
            </form>
        </div>
    );
}
