import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJson, setJson } from "../lib/storage";
import { addNotification } from "../lib/notifications";
import { logAudit } from "../lib/audit";

type Priority = "low" | "medium" | "high";
type Status = "new" | "in-review" | "scheduled" | "resolved";

type TriageOverride = {
    priority?: Priority;
    status?: Status;
    owner?: string;
};

type TriageItem = {
    id: string;
    source: string;
    name: string;
    reason: string;
    createdAt: string;
    priority: Priority;
    status: Status;
    contact?: string;
};

const OVERRIDE_KEY = "hb_triage_overrides";
const PREFILL_KEY = "hb_prefill_appointment";

export default function TriageBoardPage() {
    const navigate = useNavigate();
    const [overrides, setOverrides] = useState<Record<string, TriageOverride>>(
        () => getJson<Record<string, TriageOverride>>(OVERRIDE_KEY, {})
    );
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 30000);
        return () => window.clearInterval(timer);
    }, []);

    const items = useMemo((): TriageItem[] => {
        const appts = getJson<any[]>("hb_appointments", []);
        const symptoms = getJson<any[]>("hb_symptom_logs", []);
        const messages = getJson<any[]>("hb_messages", []);

        const appointmentItems = appts.map((item) => ({
            id: `appt-${item.id}`,
            source: "Appointment",
            name: item.name,
            reason: item.reason || "Consultation request",
            createdAt: item.date || item.createdAt || new Date().toISOString(),
            priority: "medium" as Priority,
            status: (item.status === "completed" ? "resolved" : item.status === "confirmed" ? "scheduled" : "new") as Status,
            contact: item.email,
        }));

        const symptomItems = symptoms.map((item) => {
            const priority: Priority =
                item?.redFlag || item?.severity === "Severe" ? "high" : "medium";
            return {
            id: `sym-${item.id}`,
            source: "Symptom Analysis",
            name: item.patientName || "Guest patient",
            reason: item.summary || item.chiefComplaint || "Symptom analysis completed",
            createdAt: item.createdAt,
            priority,
            status: "new" as Status,
            contact: item.email,
            };
        });

        const messageItems = messages.map((item) => ({
            id: `msg-${item.id}`,
            source: "Secure Message",
            name: item.sender === "you" ? "Patient message" : "Care team",
            reason: item.text,
            createdAt: item.createdAt,
            priority: "low" as Priority,
            status: "new" as Status,
        }));

        const merged = [...appointmentItems, ...symptomItems, ...messageItems].map((entry) => {
            const override = overrides[entry.id];
            return {
                ...entry,
                priority: override?.priority || entry.priority,
                status: override?.status || entry.status,
            };
        });

        return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [overrides]);

    const updateOverride = (id: string, patch: TriageOverride) => {
        const next = { ...overrides, [id]: { ...overrides[id], ...patch } };
        setOverrides(next);
        setJson(OVERRIDE_KEY, next);
    };

    const createFollowUp = (item: TriageItem) => {
        setJson(PREFILL_KEY, {
            name: item.name,
            email: item.contact || "",
            phone: "",
            reason: `Follow-up: ${item.reason}`,
            date: "",
        });
        addNotification({
            title: "Follow-up started",
            body: `Appointment pre-filled for ${item.name}.`,
            type: "success",
        });
        logAudit("triage_followup_created", item.name);
        navigate("/appointments");
    };

    const formatMinutes = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs}h ${mins}m`;
    };

    const getSla = (priority: Priority, minutes: number) => {
        const limits = priority === "high" ? [10, 20] : priority === "medium" ? [30, 60] : [90, 180];
        if (minutes <= limits[0]) {
            return { label: "On track", tone: "bg-emerald-500/20 text-emerald-100 border-emerald-500/40" };
        }
        if (minutes <= limits[1]) {
            return { label: "At risk", tone: "bg-amber-500/20 text-amber-100 border-amber-500/40" };
        }
        return { label: "Breach", tone: "bg-rose-500/20 text-rose-100 border-rose-500/40" };
    };

    const priorityTone = (value: Priority) => {
        switch (value) {
            case "high":
                return "bg-rose-500/20 text-rose-100 border-rose-500/40";
            case "medium":
                return "bg-amber-500/20 text-amber-100 border-amber-500/40";
            default:
                return "bg-emerald-500/20 text-emerald-100 border-emerald-500/40";
        }
    };

    const statusTone = (value: Status) => {
        switch (value) {
            case "scheduled":
                return "bg-sky-500/20 text-sky-100 border-sky-500/40";
            case "resolved":
                return "bg-slate-500/20 text-slate-200 border-slate-500/40";
            case "in-review":
                return "bg-purple-500/20 text-purple-100 border-purple-500/40";
            default:
                return "bg-amber-500/20 text-amber-100 border-amber-500/40";
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Triage Board</h1>
                    <p className="mt-2 text-textSecondary">
                        Prioritize urgent cases and follow-ups across appointments, symptoms, and messages.
                    </p>
                </div>
            </div>

            <div className="mt-6 grid gap-4">
                {items.length === 0 && (
                    <div className="rounded-lg border border-white/10 bg-secondary p-6 text-textSecondary">
                        No triage items yet.
                    </div>
                )}
                {items.map((item) => {
                    const minutes = Math.max(
                        0,
                        Math.floor((now - new Date(item.createdAt).getTime()) / 60000)
                    );
                    const sla = getSla(item.priority, minutes);
                    return (
                        <div key={item.id} className="rounded-lg border border-white/10 bg-secondary p-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase text-textSecondary">
                                        <span>{item.source}</span>
                                        <span className={`rounded-full border px-2 py-0.5 ${priorityTone(item.priority)}`}>
                                            {item.priority}
                                        </span>
                                        <span className={`rounded-full border px-2 py-0.5 ${statusTone(item.status)}`}>
                                            {item.status}
                                        </span>
                                        <span className={`rounded-full border px-2 py-0.5 ${sla.tone}`}>
                                            SLA {sla.label}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-lg font-semibold">{item.name}</div>
                                    <div className="text-sm text-textSecondary">{item.reason}</div>
                                    <div className="mt-2 text-xs text-textSecondary">
                                        {new Date(item.createdAt).toLocaleString()} - Waiting {formatMinutes(minutes)}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 items-start">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {item.contact && (
                                            <a
                                                href={`mailto:${item.contact}`}
                                                className="rounded-md border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                                            >
                                                Email
                                            </a>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => navigate("/messages")}
                                            className="rounded-md border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                                        >
                                            Open messages
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => createFollowUp(item)}
                                            className="rounded-md border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                                        >
                                            Create follow-up
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <select
                                            value={item.priority}
                                            onChange={(e) => updateOverride(item.id, { priority: e.target.value as Priority })}
                                            className="rounded-md bg-primary border border-white/20 px-3 py-1 text-xs"
                                        >
                                            <option value="low">Low priority</option>
                                            <option value="medium">Medium priority</option>
                                            <option value="high">High priority</option>
                                        </select>
                                        <select
                                            value={item.status}
                                            onChange={(e) => updateOverride(item.id, { status: e.target.value as Status })}
                                            className="rounded-md bg-primary border border-white/20 px-3 py-1 text-xs"
                                        >
                                            <option value="new">New</option>
                                            <option value="in-review">In review</option>
                                            <option value="scheduled">Scheduled</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
