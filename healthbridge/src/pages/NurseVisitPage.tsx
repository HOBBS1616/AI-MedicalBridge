import { useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { addNotification } from "../lib/notifications";
import { logAudit } from "../lib/audit";
import { getJson, setJson } from "../lib/storage";

const STORAGE_KEY = "hb_nurse_requests";

type NurseRequest = {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    reason: string;
    preferredDate: string;
    urgency: "routine" | "urgent" | "critical";
    status: "new" | "assigned" | "en-route" | "completed";
    createdAt: string;
};

export default function NurseVisitPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [reason, setReason] = useState("");
    const [preferredDate, setPreferredDate] = useState("");
    const [urgency, setUrgency] = useState<NurseRequest["urgency"]>("routine");
    const [status, setStatus] = useState("");

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setStatus("");
        const payload: NurseRequest = {
            id: `nurse_${Date.now()}`,
            name,
            email,
            phone,
            address,
            reason,
            preferredDate,
            urgency,
            status: "new",
            createdAt: new Date().toISOString(),
        };

        const existing = getJson<NurseRequest[]>(STORAGE_KEY, []);
        setJson(STORAGE_KEY, [payload, ...existing]);

        try {
            await fetch(`${API_BASE_URL}/api/nurse-visits`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            setStatus("Nurse visit request submitted. A coordinator will confirm your appointment.");
            addNotification({
                title: "Nurse visit requested",
                body: "We will confirm a nurse and time shortly.",
                type: "success",
            });
            logAudit("nurse_visit_requested", payload.name);
        } catch {
            setStatus("Saved locally. We will sync once the network is available.");
        }

        setName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setReason("");
        setPreferredDate("");
        setUrgency("routine");
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div>
                <h1 className="text-3xl font-bold">Nurse Home Visit</h1>
                <p className="mt-2 text-textSecondary">
                    Request a licensed nurse for in-home care, follow-ups, or medication support.
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
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        placeholder="Home address"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <input
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        type="date"
                        required
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                    <select
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value as NurseRequest["urgency"])}
                        className="rounded-md bg-primary border border-white/20 px-3 py-3 text-white"
                    >
                        <option value="routine">Routine</option>
                        <option value="urgent">Urgent</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>

                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="Reason for the nurse visit"
                    className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    rows={3}
                />

                {status && (
                    <div className="rounded-md border border-white/10 bg-primary px-4 py-3 text-sm">
                        {status}
                    </div>
                )}

                <button type="submit" className="virtua-button bg-faith text-black">
                    Request nurse visit
                </button>
            </form>
        </div>
    );
}
