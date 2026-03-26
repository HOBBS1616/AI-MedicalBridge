import { NavLink } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";

export default function StaffPortalPage() {
    const user = getCurrentUser();
    const cards = [
        {
            title: "Triage board",
            description: "Prioritize new cases and coordinate follow-ups.",
            to: "/triage",
            cta: "Open triage",
        },
        {
            title: "Clinician workflow",
            description: "Approve prescriptions and notify pharmacies.",
            to: "/clinician",
            cta: "Review approvals",
        },
        {
            title: "Patient registry",
            description: "Review registered patients and follow-up status.",
            to: "/patients",
            cta: "View patients",
        },
        {
            title: "Emergency queue",
            description: "See incoming ambulance requests and dispatch status.",
            to: "/emergency-queue",
            cta: "Open queue",
        },
        {
            title: "Lab request queue",
            description: "Review incoming test requests and confirm scheduling.",
            to: "/lab-queue",
            cta: "Open lab queue",
        },
        {
            title: "Nurse dispatch",
            description: "Assign nurses to home visits and monitor status.",
            to: "/nurse-dispatch",
            cta: "Open dispatch",
        },
        {
            title: "Operations dashboard",
            description: "Monitor counts, audit logs, and public status banners.",
            to: "/dashboard",
            cta: "Open dashboard",
        },
        {
            title: "Patient records",
            description: "Admin-only access to sensitive records.",
            to: "/records",
            cta: "View records",
        },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Staff Portal</h1>
                    <p className="mt-2 text-textSecondary">
                        {user ? `Welcome, ${user.name}.` : "Clinician tools for the care team."}
                    </p>
                </div>
                <NavLink to="/dashboard" className="virtua-button bg-faith text-black">
                    Go to ops
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
