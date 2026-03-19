import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJson, setJson } from "../lib/storage";
import { addNotification } from "../lib/notifications";
import { logAudit } from "../lib/audit";

type Profile = {
    name: string;
    email: string;
    phone: string;
    age: string;
    bloodType: string;
    allergies: string;
    primaryDoctor: string;
    emergencyContact: string;
};

type PlanItem = {
    id: string;
    title: string;
    schedule: string;
    notes: string;
    done: boolean;
};

type Reminder = {
    id: string;
    medication: string;
    time: string;
    instructions: string;
    active: boolean;
};

type TimelineEntry = {
    id: string;
    title: string;
    detail: string;
    date: string;
};

const PROFILE_KEY = "hb_patient_profile";
const PLAN_KEY = "hb_care_plan";
const REMINDER_KEY = "hb_med_reminders";
const PREFILL_KEY = "hb_prefill_appointment";

const defaultProfile: Profile = {
    name: "",
    email: "",
    phone: "",
    age: "",
    bloodType: "",
    allergies: "",
    primaryDoctor: "",
    emergencyContact: "",
};

export default function PatientProfilePage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile>(
        () => getJson<Profile>(PROFILE_KEY, defaultProfile)
    );
    const [planItems, setPlanItems] = useState<PlanItem[]>(
        () => getJson<PlanItem[]>(PLAN_KEY, [])
    );
    const [reminders, setReminders] = useState<Reminder[]>(
        () => getJson<Reminder[]>(REMINDER_KEY, [])
    );
    const [planForm, setPlanForm] = useState({ title: "", schedule: "", notes: "" });
    const [reminderForm, setReminderForm] = useState({ medication: "", time: "", instructions: "" });

    const appointments = getJson<any[]>("hb_appointments", []);
    const symptomLogs = getJson<any[]>("hb_symptom_logs", []);

    const timeline = useMemo<TimelineEntry[]>(() => {
        const apptEntries = appointments.map((item) => ({
            id: `appt-${item.id}`,
            title: "Appointment",
            detail: `${item.reason || "Consult"} with ${item.name}`,
            date: item.date || item.createdAt || new Date().toISOString(),
        }));
        const symptomEntries = symptomLogs.map((item) => ({
            id: `sym-${item.id}`,
            title: "Symptom Analysis",
            detail: item.summary || item.chiefComplaint || "Symptom check completed",
            date: item.createdAt,
        }));
        return [...apptEntries, ...symptomEntries].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [appointments, symptomLogs]);

    const lastAppointment = useMemo(() => {
        if (!appointments.length) return null;
        return [...appointments].sort(
            (a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
        )[0];
    }, [appointments]);

    const updateProfile = (field: keyof Profile, value: string) => {
        const next = { ...profile, [field]: value };
        setProfile(next);
        setJson(PROFILE_KEY, next);
    };

    const addPlanItem = () => {
        if (!planForm.title.trim()) return;
        const item: PlanItem = {
            id: crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
            title: planForm.title,
            schedule: planForm.schedule,
            notes: planForm.notes,
            done: false,
        };
        const next = [item, ...planItems];
        setPlanItems(next);
        setJson(PLAN_KEY, next);
        setPlanForm({ title: "", schedule: "", notes: "" });
        logAudit("care_plan_item_added", item.title);
    };

    const togglePlanItem = (id: string) => {
        const next = planItems.map((item) => (item.id === id ? { ...item, done: !item.done } : item));
        setPlanItems(next);
        setJson(PLAN_KEY, next);
    };

    const addReminder = () => {
        if (!reminderForm.medication.trim()) return;
        const item: Reminder = {
            id: crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
            medication: reminderForm.medication,
            time: reminderForm.time,
            instructions: reminderForm.instructions,
            active: true,
        };
        const next = [item, ...reminders];
        setReminders(next);
        setJson(REMINDER_KEY, next);
        setReminderForm({ medication: "", time: "", instructions: "" });
        logAudit("medication_reminder_added", item.medication);
    };

    const toggleReminder = (id: string) => {
        const next = reminders.map((item) => (item.id === id ? { ...item, active: !item.active } : item));
        setReminders(next);
        setJson(REMINDER_KEY, next);
    };

    const bookAgain = () => {
        if (!lastAppointment) return;
        setJson(PREFILL_KEY, {
            name: lastAppointment.name,
            email: lastAppointment.email,
            phone: lastAppointment.phone,
            reason: `Follow-up: ${lastAppointment.reason || "Consultation"}`,
            date: "",
        });
        addNotification({
            title: "Follow-up ready",
            body: "We pre-filled a follow-up appointment for you.",
            type: "success",
        });
        logAudit("follow_up_prefilled", lastAppointment.name);
        navigate("/appointments");
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Patient Profile & Care Plan</h1>
                    <p className="mt-2 text-textSecondary">
                        Keep the essential details, care plans, and reminders in one place.
                    </p>
                </div>
                {lastAppointment && (
                    <button type="button" onClick={bookAgain} className="virtua-button bg-faith text-black">
                        Book again
                    </button>
                )}
            </div>

            <div className="mt-8 grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-lg border border-white/10 bg-secondary p-6">
                    <h2 className="text-xl font-semibold">Profile details</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <input
                            value={profile.name}
                            onChange={(e) => updateProfile("name", e.target.value)}
                            placeholder="Full name"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <input
                            value={profile.email}
                            onChange={(e) => updateProfile("email", e.target.value)}
                            placeholder="Email"
                            type="email"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <input
                            value={profile.phone}
                            onChange={(e) => updateProfile("phone", e.target.value)}
                            placeholder="Phone"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <input
                            value={profile.age}
                            onChange={(e) => updateProfile("age", e.target.value)}
                            placeholder="Age"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <input
                            value={profile.bloodType}
                            onChange={(e) => updateProfile("bloodType", e.target.value)}
                            placeholder="Blood type"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <input
                            value={profile.primaryDoctor}
                            onChange={(e) => updateProfile("primaryDoctor", e.target.value)}
                            placeholder="Primary doctor"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <input
                            value={profile.allergies}
                            onChange={(e) => updateProfile("allergies", e.target.value)}
                            placeholder="Allergies"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <input
                            value={profile.emergencyContact}
                            onChange={(e) => updateProfile("emergencyContact", e.target.value)}
                            placeholder="Emergency contact"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                    </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-secondary p-6">
                    <h2 className="text-xl font-semibold">Visit history</h2>
                    <div className="mt-4 space-y-3 text-sm text-textSecondary max-h-80 overflow-y-auto pr-2">
                        {timeline.length === 0 && <div>No visits yet.</div>}
                        {timeline.map((entry) => (
                            <div key={entry.id} className="rounded-md border border-white/10 bg-primary p-3">
                                <div className="font-semibold text-white">{entry.title}</div>
                                <div className="text-xs">{new Date(entry.date).toLocaleString()}</div>
                                <div className="mt-1">{entry.detail}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="rounded-lg border border-white/10 bg-secondary p-6">
                    <h2 className="text-xl font-semibold">Care plan</h2>
                    <div className="mt-4 grid gap-3">
                        <input
                            value={planForm.title}
                            onChange={(e) => setPlanForm((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="Plan item (e.g., Daily blood pressure check)"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <input
                            value={planForm.schedule}
                            onChange={(e) => setPlanForm((prev) => ({ ...prev, schedule: e.target.value }))}
                            placeholder="Schedule (e.g., Morning, Evening)"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <textarea
                            value={planForm.notes}
                            onChange={(e) => setPlanForm((prev) => ({ ...prev, notes: e.target.value }))}
                            placeholder="Notes"
                            rows={2}
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <button type="button" onClick={addPlanItem} className="virtua-button bg-faith text-black">
                            Add care item
                        </button>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                        {planItems.length === 0 && <div className="text-textSecondary">No care plan items yet.</div>}
                        {planItems.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => togglePlanItem(item.id)}
                                className={`w-full rounded-md border px-3 py-2 text-left ${
                                    item.done ? "border-faith text-faith" : "border-white/10 text-textSecondary"
                                }`}
                            >
                                <div className="font-semibold text-white">{item.title}</div>
                                <div className="text-xs">{item.schedule}</div>
                                {item.notes && <div className="text-xs">{item.notes}</div>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-secondary p-6">
                    <h2 className="text-xl font-semibold">Medication reminders</h2>
                    <div className="mt-4 grid gap-3">
                        <input
                            value={reminderForm.medication}
                            onChange={(e) => setReminderForm((prev) => ({ ...prev, medication: e.target.value }))}
                            placeholder="Medication"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <input
                            value={reminderForm.time}
                            onChange={(e) => setReminderForm((prev) => ({ ...prev, time: e.target.value }))}
                            placeholder="Time (e.g., 8:00 AM)"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <input
                            value={reminderForm.instructions}
                            onChange={(e) => setReminderForm((prev) => ({ ...prev, instructions: e.target.value }))}
                            placeholder="Instructions"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <button type="button" onClick={addReminder} className="virtua-button">
                            Add reminder
                        </button>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                        {reminders.length === 0 && <div className="text-textSecondary">No reminders yet.</div>}
                        {reminders.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleReminder(item.id)}
                                className={`w-full rounded-md border px-3 py-2 text-left ${
                                    item.active ? "border-white/10 text-textSecondary" : "border-faith text-faith"
                                }`}
                            >
                                <div className="font-semibold text-white">{item.medication}</div>
                                <div className="text-xs">{item.time}</div>
                                {item.instructions && <div className="text-xs">{item.instructions}</div>}
                                <div className="text-xs mt-1">
                                    {item.active ? "Active" : "Paused"}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
