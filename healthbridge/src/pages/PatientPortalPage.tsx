import { NavLink } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";

export default function PatientPortalPage() {
    const user = getCurrentUser();
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
