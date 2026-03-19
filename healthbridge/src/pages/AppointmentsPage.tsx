import { useEffect, useMemo, useState } from "react";
import { addNotification } from "../lib/notifications";
import { getJson, setJson } from "../lib/storage";
import { logAudit } from "../lib/audit";

type Appointment = {
    id: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    reason: string;
    status: "requested" | "confirmed" | "completed";
};

const KEY = "hb_appointments";
const PREFILL_KEY = "hb_prefill_appointment";

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>(
        () => getJson<Appointment[]>(KEY, [])
    );
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        date: "",
        reason: "",
    });

    const upcoming = useMemo(() => appointments, [appointments]);
    const lastAppointment = useMemo(() => {
        if (!appointments.length) return null;
        return [...appointments].sort(
            (a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
        )[0];
    }, [appointments]);

    useEffect(() => {
        const prefill = getJson<any | null>(PREFILL_KEY, null);
        if (prefill) {
            setForm((prev) => ({
                ...prev,
                name: prefill.name || prev.name,
                email: prefill.email || prev.email,
                phone: prefill.phone || prev.phone,
                reason: prefill.reason || prev.reason,
                date: prefill.date || prev.date,
            }));
            setJson(PREFILL_KEY, null);
        }
    }, []);

    const updateField = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const saveAppointments = (next: Appointment[]) => {
        setAppointments(next);
        setJson(KEY, next);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const id = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        const entry: Appointment = {
            id,
            name: form.name,
            email: form.email,
            phone: form.phone,
            date: form.date,
            reason: form.reason,
            status: "requested",
        };
        const next = [entry, ...appointments];
        saveAppointments(next);
        addNotification({
            title: "Appointment requested",
            body: `${entry.name} requested a consult on ${new Date(entry.date).toLocaleString()}.`,
            type: "success",
        });
        logAudit("appointment_requested", `${entry.name} requested an appointment`);
        setForm({ name: "", email: "", phone: "", date: "", reason: "" });
    };

    const updateStatus = (id: string, status: Appointment["status"]) => {
        const next = appointments.map((item) => (item.id === id ? { ...item, status } : item));
        saveAppointments(next);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Appointments</h1>
                    <p className="mt-2 text-textSecondary">
                        Request a consult and track upcoming visits.
                    </p>
                </div>
                {lastAppointment && (
                    <button
                        type="button"
                        className="rounded-md border border-white/20 px-4 py-2 text-sm text-textSecondary hover:bg-white/10"
                        onClick={() => {
                            setJson(PREFILL_KEY, {
                                name: lastAppointment.name,
                                email: lastAppointment.email,
                                phone: lastAppointment.phone,
                                reason: `Follow-up: ${lastAppointment.reason || "Consultation"}`,
                                date: "",
                            });
                            setForm((prev) => ({
                                ...prev,
                                name: lastAppointment.name,
                                email: lastAppointment.email,
                                phone: lastAppointment.phone,
                                reason: `Follow-up: ${lastAppointment.reason || "Consultation"}`,
                            }));
                        }}
                    >
                        Book again
                    </button>
                )}
            </div>

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
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        required
                        type="email"
                        placeholder="Email"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                    <input
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        required
                        placeholder="Phone"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                    <input
                        value={form.date}
                        onChange={(e) => updateField("date", e.target.value)}
                        required
                        type="datetime-local"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                </div>
                <textarea
                    value={form.reason}
                    onChange={(e) => updateField("reason", e.target.value)}
                    required
                    placeholder="Reason for visit"
                    className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    rows={3}
                />
                <button type="submit" className="virtua-button bg-faith text-black w-full sm:w-auto">
                    Request Appointment
                </button>
            </form>

            <div className="mt-8 rounded-lg border border-white/10 bg-secondary p-6">
                <h2 className="text-xl font-semibold">Upcoming Requests</h2>
                {upcoming.length === 0 ? (
                    <p className="mt-3 text-textSecondary">No appointment requests yet.</p>
                ) : (
                    <div className="mt-4 space-y-4">
                        {upcoming.map((item) => (
                            <div key={item.id} className="rounded-md border border-white/10 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-textSecondary">
                                            {new Date(item.date).toLocaleString()} • {item.reason}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase">
                                            {item.status}
                                        </span>
                                        <select
                                            value={item.status}
                                            onChange={(e) => updateStatus(item.id, e.target.value as Appointment["status"])}
                                            className="rounded-md bg-primary border border-white/20 px-2 py-1 text-xs"
                                        >
                                            <option value="requested">Requested</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setJson(PREFILL_KEY, {
                                                    name: item.name,
                                                    email: item.email,
                                                    phone: item.phone,
                                                    reason: `Follow-up: ${item.reason || "Consultation"}`,
                                                    date: "",
                                                });
                                                addNotification({
                                                    title: "Follow-up ready",
                                                    body: `Prefilled for ${item.name}.`,
                                                    type: "info",
                                                });
                                            }}
                                            className="rounded-md border border-white/20 px-3 py-1 text-xs text-textSecondary hover:bg-white/10"
                                        >
                                            Follow-up
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-textSecondary">
                                    Contact: {item.email} • {item.phone}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
