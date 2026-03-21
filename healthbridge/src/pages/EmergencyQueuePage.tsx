import { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/api";

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

export default function EmergencyQueuePage() {
    const [requests, setRequests] = useState<EmergencyRequest[]>([]);
    const [status, setStatus] = useState("Loading emergency queue...");

    const load = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/emergency-requests`);
            if (!res.ok) throw new Error("Failed to load");
            const data = await res.json();
            setRequests(data || []);
            setStatus(data.length ? "Active requests" : "No emergency requests.");
        } catch (err) {
            console.error(err);
            setStatus("Unable to load emergency requests.");
        }
    };

    useEffect(() => {
        load();
    }, []);

    const updateStatus = async (id: string, next: string) => {
        const local = requests.map((item) => (item.id === id ? { ...item, status: next } : item));
        setRequests(local);
        try {
            await fetch(`${API_BASE_URL}/api/emergency-requests/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: next }),
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Emergency Queue</h1>
                    <p className="mt-2 text-textSecondary">{status}</p>
                </div>
                <button type="button" onClick={load} className="rounded-md border border-white/20 px-4 py-2 text-sm text-textSecondary hover:bg-white/10">
                    Refresh
                </button>
            </div>

            <div className="mt-6 grid gap-4">
                {requests.length === 0 && (
                    <div className="rounded-lg border border-white/10 bg-secondary p-6 text-textSecondary">
                        No emergency requests yet.
                    </div>
                )}
                {requests.map((req) => (
                    <div key={req.id} className="rounded-lg border border-white/10 bg-secondary p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="text-xs uppercase text-textSecondary">Urgency: {req.urgency}</div>
                                <div className="text-lg font-semibold">{req.name}</div>
                                <div className="text-sm text-textSecondary">{req.symptoms}</div>
                                <div className="mt-2 text-xs text-textSecondary">{req.location}</div>
                                <div className="mt-1 text-xs text-textSecondary">
                                    {new Date(req.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 items-start">
                                <div className="text-xs text-textSecondary">Contact: {req.phone}</div>
                                <select
                                    value={req.status}
                                    onChange={(e) => updateStatus(req.id, e.target.value)}
                                    className="rounded-md bg-primary border border-white/20 px-3 py-1 text-xs"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="dispatched">Dispatched</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
