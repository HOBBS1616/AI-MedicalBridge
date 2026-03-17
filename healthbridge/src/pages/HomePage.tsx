import { NavLink } from "react-router-dom";

export default function HomePage() {
    const portalCards = [
        {
            title: "Care Dashboard",
            description: "Track activity, approvals, and notifications in one view.",
            to: "/dashboard",
            cta: "Open dashboard",
        },
        {
            title: "Appointments",
            description: "Request, triage, and confirm virtual visits quickly.",
            to: "/appointments",
            cta: "Manage visits",
        },
        {
            title: "Secure Messages",
            description: "Keep patient communication private and organized.",
            to: "/messages",
            cta: "Open inbox",
        },
        {
            title: "Clinician Console",
            description: "Approve prescriptions and notify pharmacies with audit logging.",
            to: "/clinician",
            cta: "Review approvals",
        },
        {
            title: "Delivery Tracking",
            description: "Monitor pharmacy drop-offs and notify patients.",
            to: "/delivery",
            cta: "Track delivery",
        },
        {
            title: "Patient Registry",
            description: "Search registrations and flag follow-up needs.",
            to: "/patients",
            cta: "Review patients",
        },
        {
            title: "Privacy Center",
            description: "Download or delete local records with one click.",
            to: "/privacy",
            cta: "Manage privacy",
        },
        {
            title: "Symptom Analysis",
            description: "Start structured triage with consent-first guidance.",
            to: "/symptoms",
            cta: "Run analysis",
        },
    ];

    return (
        <>
            <section className="virtua-hero">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold">
                            Healing with Faith and Technology - Here for Good, Here for You.
                        </h1>
                        <p className="mt-4 text-textSecondary">
                            "So do not fear, for I am with you; do not be dismayed, for I am your God." - Isaiah 41:10
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <NavLink to="/get-care-now" className="virtua-button">Get Care Now</NavLink>
                            <NavLink to="/find-doctor" className="virtua-button bg-faith text-black">Find a Doctor</NavLink>
                        </div>
                        <div className="mt-6 flex items-center gap-3 text-xs text-textSecondary">
                            <div className="heartbeat-track">
                                <span className="heartbeat-dot" />
                            </div>
                            <span>Live care pulse</span>
                        </div>
                    </div>

                    <div className="rounded-lg overflow-hidden h-48 sm:h-64">
                        <video
                            src="/Ambulance.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </section>

            <section className="py-10 sm:py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold">Care Command Center</h2>
                            <p className="mt-2 text-textSecondary">
                                Jump straight into the new tools we added for patients, clinicians, and operations.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {portalCards.map((card) => (
                            <div key={card.title} className="virtua-card flex flex-col justify-between">
                                <div>
                                    <h3 className="font-medium">{card.title}</h3>
                                    <p className="mt-2 text-sm text-textSecondary">{card.description}</p>
                                </div>
                                <NavLink to={card.to} className="virtua-button mt-4 self-start">
                                    {card.cta}
                                </NavLink>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
