import { NavLink } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";
import { getJson } from "../lib/storage";

export default function PatientPortalPage() {
    const user = getCurrentUser();
    const symptoms = getJson<any[]>("hb_symptom_logs", []);
    const appointments = getJson<any[]>("hb_appointments", []);
    const messages = getJson<any[]>("hb_messages", []);
    const followUpDone =
        messages.length > 0 ||
        appointments.some((appt) => ["confirmed", "completed"].includes(appt.status));

    const steps = [
        {
            key: "login",
            title: user ? "Signed in" : "Create account",
            description: user ? "Welcome back. You're signed in and ready." : "Set up your profile to start care.",
            to: user ? "/patient" : "/register",
            completed: Boolean(user),
        },
        {
            key: "symptoms",
            title: "Symptom analysis",
            description: "Answer guided questions for a quick triage summary.",
            to: "/symptoms",
            completed: symptoms.length > 0,
        },
        {
            key: "appointment",
            title: "Book appointment",
            description: "Choose a time for your virtual consult.",
            to: "/appointments",
            completed: appointments.length > 0,
        },
        {
            key: "followup",
            title: "Follow-up & care plan",
            description: "Review recommendations and chat with your care team.",
            to: "/messages",
            completed: followUpDone,
        },
    ];

    const completedCount = steps.filter((step) => step.completed).length;
    const progress = Math.round((completedCount / steps.length) * 100);
    const nextStep = steps.find((step) => !step.completed) || steps[steps.length - 1];

    const cards = [
        {
            title: "Book an appointment",
            description: "Request a consult and pick a time that works for you.",
            to: "/appointments",
            cta: "Book now",
        },
        {
            title: "Symptom analysis",
            description: "Answer guided questions and receive a summary.",
            to: "/symptoms",
            cta: "Start analysis",
        },
        {
            title: "Care plan",
            description: "Manage medications, reminders, and follow-up tasks.",
            to: "/patient-profile",
            cta: "Open care plan",
        },
        {
            title: "Secure messages",
            description: "Message your care team and keep conversations in one place.",
            to: "/messages",
            cta: "Open inbox",
        },
        {
            title: "Emergency request",
            description: "Request an ambulance without leaving home.",
            to: "/emergency",
            cta: "Request help",
        },
        {
            title: "Tests & labs",
            description: "Request home sample pickup or lab partner testing.",
            to: "/tests",
            cta: "Request test",
        },
        {
            title: "Nurse home visit",
            description: "Schedule a nurse for in-home support.",
            to: "/nurse-visit",
            cta: "Book nurse",
        },
        {
            title: "HMO & coverage",
            description: "Verify eligibility and download a coverage summary.",
            to: "/hmo-coverage",
            cta: "Check coverage",
        },
        {
            title: "Trust & safety",
            description: "Understand privacy, consent, and care standards.",
            to: "/trust",
            cta: "View trust",
        },
        {
            title: "Delivery tracking",
            description: "Track pharmacy deliveries and expected arrival.",
            to: "/delivery",
            cta: "Track delivery",
        },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Patient Portal</h1>
                    <p className="mt-2 text-textSecondary">
                        {user ? `Welcome back, ${user.name}.` : "Your care tools are ready."}
                    </p>
                </div>
                <NavLink to="/share" className="virtua-button bg-faith text-black">
                    Share HealthBridge
                </NavLink>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr,1fr]">
                <div className="virtua-card relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-cyan-500/20" />
                    <div className="relative z-10">
                        <div className="text-xs uppercase tracking-wide text-textSecondary">Start here</div>
                        <h2 className="mt-2 text-2xl font-semibold">Your care journey</h2>
                        <p className="mt-2 text-sm text-textSecondary">
                            Follow the guided steps to go from triage to a confirmed appointment and follow-up care.
                        </p>

                        <div className="mt-5">
                            <div className="h-2 rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-faith transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="mt-2 text-xs text-textSecondary">{progress}% complete</div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-textSecondary">
                            <span>Next step</span>
                            <span className="rounded-full border border-white/20 px-2 py-0.5 uppercase text-[10px] text-white">
                                {nextStep.title}
                            </span>
                        </div>
                        <NavLink to={nextStep.to} className="virtua-button mt-4 inline-flex">
                            Continue journey
                        </NavLink>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {steps.map((step, index) => {
                        const isNext = nextStep.key === step.key && !step.completed;
                        return (
                            <div
                                key={step.key}
                                className={`rounded-lg border border-white/10 p-4 ${
                                    step.completed ? "bg-secondary/80" : "bg-primary/40"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase text-textSecondary">Step {index + 1}</span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${
                                            step.completed
                                                ? "bg-emerald-500/20 text-emerald-100"
                                                : isNext
                                                    ? "bg-faith/20 text-faith"
                                                    : "bg-white/10 text-textSecondary"
                                        }`}
                                    >
                                        {step.completed ? "Done" : isNext ? "Next" : "Queued"}
                                    </span>
                                </div>
                                <div className="mt-3 text-sm font-semibold">{step.title}</div>
                                <p className="mt-2 text-xs text-textSecondary">{step.description}</p>
                                <NavLink to={step.to} className="mt-3 inline-flex text-xs text-faith hover:underline">
                                    Go to step
                                </NavLink>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <div key={card.title} className="virtua-card flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">{card.title}</h2>
                            <p className="mt-2 text-sm text-textSecondary">{card.description}</p>
                        </div>
                        <NavLink to={card.to} className="virtua-button mt-4 self-start">
                            {card.cta}
                        </NavLink>
                    </div>
                ))}
            </div>
        </div>
    );
}
