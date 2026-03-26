import { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/api";
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

export default function NurseDispatchPage() {
    const [requests, setRequests] = useState<NurseRequest[]>([]);
    const [status, setStatus] = useState("Loading nurse visits...");
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 30000);
        return () => window.clearInterval(timer);
    }, []);

    const load = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/nurse-visits`);
            if (!res.ok) throw new Error("Failed to load");
            const data = await res.json();
            setRequests(data || []);
            setStatus(data.length ? "Active nurse visits" : "No nurse visits.");
        } catch (err) {
            console.error(err);
            const local = getJson<NurseRequest[]>(STORAGE_KEY, []);
            setRequests(local);
            setStatus(local.length ? "Showing local requests" : "No nurse visits.");
        }
    };

    useEffect(() => {
        load();
    }, []);

    const updateStatus = async (id: string, next: NurseRequest["status"]) => {
        const nextList = requests.map((item) => (item.id === id ? { ...item, status: next } : item));
        setRequests(nextList);
        setJson(STORAGE_KEY, nextList);
        try {
            await fetch(`${API_BASE_URL}/api/nurse-visits/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: next }),
            });
        } catch (err) {
            console.error(err);
        }
    };

    const formatMinutes = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs}h ${mins}m`;
    };

    const getSla = (urgency: NurseRequest["urgency"], minutes: number) => {
        const limits = urgency === "critical" ? [30, 60] : urgency === "urgent" ? [90, 180] : [360, 720];
        if (minutes <= limits[0]) {
            return { label: "On track", tone: "bg-emerald-500/20 text-emerald-100 border-emerald-500/40" };
        }
        if (minutes <= limits[1]) {
            return { label: "At risk", tone: "bg-amber-500/20 text-amber-100 border-amber-500/40" };
        }
        return { label: "Breach", tone: "bg-rose-500/20 text-rose-100 border-rose-500/40" };
    };

    const urgencyTone = (value: NurseRequest["urgency"]) => {
        switch (value) {
            case "critical":
                return "bg-rose-500/20 text-rose-100 border-rose-500/40";
            case "urgent":
                return "bg-amber-500/20 text-amber-100 border-amber-500/40";
            default:
                return "bg-emerald-500/20 text-emerald-100 border-emerald-500/40";
        }
    };

    const statusTone = (value: NurseRequest["status"]) => {
        switch (value) {
            case "assigned":
                return "bg-sky-500/20 text-sky-100 border-sky-500/40";
            case "en-route":
                return "bg-emerald-500/20 text-emerald-100 border-emerald-500/40";
            case "completed":
                return "bg-slate-500/20 text-slate-200 border-slate-500/40";
            default:
                return "bg-amber-500/20 text-amber-100 border-amber-500/40";
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Nurse Dispatch Queue</h1>
                    <p className="mt-2 text-textSecondary">{status}</p>
                </div>
                <button
                    type="button"
                    onClick={load}
                    className="rounded-md border border-white/20 px-4 py-2 text-sm text-textSecondary hover:bg-white/10"
                >
                    Refresh
                </button>
            </div>

            <div className="mt-6 grid gap-4">
                {requests.length === 0 && (
                    <div className="rounded-lg border border-white/10 bg-secondary p-6 text-textSecondary">
                        No nurse visits yet.
                    </div>
                )}
                {requests.map((req) => {
                    const minutes = Math.max(
                        0,
                        Math.floor((now - new Date(req.createdAt).getTime()) / 60000)
                    );
                    const sla = getSla(req.urgency, minutes);
                    return (
                        <div key={req.id} className="rounded-lg border border-white/10 bg-secondary p-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase text-textSecondary">
                                        <span className={`rounded-full border px-2 py-0.5 ${urgencyTone(req.urgency)}`}>
                                            {req.urgency}
                                        </span>
                                        <span className={`rounded-full border px-2 py-0.5 ${statusTone(req.status)}`}>
                                            {req.status}
                                        </span>
                                        <span className={`rounded-full border px-2 py-0.5 ${sla.tone}`}>
                                            SLA {sla.label}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-lg font-semibold">{req.name}</div>
                                    <div className="text-sm text-textSecondary">{req.reason}</div>
                                    <div className="mt-2 text-xs text-textSecondary">{req.address}</div>
                                    <div className="mt-1 text-xs text-textSecondary">
                                        Preferred {req.preferredDate} - Waiting {formatMinutes(minutes)}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 items-start">
                                    <div className="text-xs text-textSecondary">Contact: {req.phone}</div>
                                    <div className="flex flex-wrap gap-2">
                                        <a
                                            href={`tel:${req.phone}`}
                                            className="rounded-md border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                                        >
                                            Call
                                        </a>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                                req.address
                                            )}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="rounded-md border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                                        >
                                            Open map
                                        </a>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => updateStatus(req.id, "assigned")}
                                            className="rounded-md border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                                        >
                                            Assign nurse
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateStatus(req.id, "en-route")}
                                            className="rounded-md border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                                        >
                                            En-route
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateStatus(req.id, "completed")}
                                            className="rounded-md border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                                        >
                                            Complete
                                        </button>
                                    </div>
                                    <select
                                        value={req.status}
                                        onChange={(e) => updateStatus(req.id, e.target.value as NurseRequest["status"])}
                                        className="rounded-md bg-primary border border-white/20 px-3 py-1 text-xs"
                                    >
                                        <option value="new">New</option>
                                        <option value="assigned">Assigned</option>
                                        <option value="en-route">En-route</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
