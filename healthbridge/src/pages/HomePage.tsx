import { useState } from "react";
import { NavLink } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";
import { addNotification } from "../lib/notifications";
import { logAudit } from "../lib/audit";
import { getJson, setJson } from "../lib/storage";

export default function HomePage() {
    const portalCards = [
        {
            title: "Patient Portal",
            description: "Start your care journey with appointments, messages, and care plans.",
            to: "/patient",
            cta: "Enter portal",
        },
        {
            title: "Appointments",
            description: "Request, triage, and confirm virtual visits quickly.",
            to: "/appointments",
            cta: "Manage visits",
        },
        {
            title: "Symptom Analysis",
            description: "Start structured triage with consent-first guidance.",
            to: "/symptoms",
            cta: "Run analysis",
        },
        {
            title: "Emergency Request",
            description: "Request an ambulance and share your location fast.",
            to: "/emergency",
            cta: "Request help",
        },
        {
            title: "Tests & Labs",
            description: "Request home sample pickup or lab partner testing.",
            to: "/tests",
            cta: "Request test",
        },
        {
            title: "Nurse Home Visit",
            description: "Schedule a nurse to support recovery at home.",
            to: "/nurse-visit",
            cta: "Book nurse",
        },
        {
            title: "Staff Portal",
            description: "Clinician and admin tools for triage, approvals, and operations.",
            to: "/staff",
            cta: "Enter staff portal",
        },
        {
            title: "FAQ & Pricing",
            description: "Understand coverage, pricing, and support.",
            to: "/faq-pricing",
            cta: "View FAQs",
        },
        {
            title: "Trust & Safety",
            description: "Learn about compliance, privacy, and clinical safety standards.",
            to: "/trust",
            cta: "Explore trust",
        },
        {
            title: "Share HealthBridge",
            description: "Invite family and friends to trusted virtual care.",
            to: "/share",
            cta: "Share now",
        },
    ];

    const testimonials = [
        {
            name: "Grace A.",
            quote: "HealthBridge helped me get care at night without leaving my kids. The follow-up felt personal.",
            outcome: "Recovery support in 2 days",
        },
        {
            name: "Dr. Nnamdi",
            quote: "The clinician console keeps prescriptions and pharmacy calls organized in one flow.",
            outcome: "Reduced response time by 40%",
        },
        {
            name: "Amaka I.",
            quote: "The symptom analysis summary made it easy to explain my situation to the doctor.",
            outcome: "Same-day consult",
        },
    ];

    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");

    const subscribe = async (event: React.FormEvent) => {
        event.preventDefault();
        const clean = email.trim().toLowerCase();
        if (!clean) return;
        const list = getJson<string[]>("hb_subscribers", []);
        if (!list.includes(clean)) {
            list.unshift(clean);
            setJson("hb_subscribers", list.slice(0, 200));
        }
        try {
            await fetch(`${API_BASE_URL}/api/subscriptions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: clean }),
            });
            setStatus("You're on the list! We'll send updates soon.");
            addNotification({
                title: "Subscribed",
                body: "You will receive HealthBridge updates.",
                type: "success",
            });
            logAudit("newsletter_subscribed", clean);
        } catch {
            setStatus("Saved locally. We'll sync when the network is available.");
        }
        setEmail("");
    };

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
                                Jump straight into the tools built for patients, clinicians, and operations.
                            </p>
                        </div>
                        <NavLink to="/faq-pricing" className="text-sm text-textSecondary hover:text-white">
                            View pricing and FAQs
                        </NavLink>
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

            <section className="py-10 sm:py-12 bg-secondary">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-2xl font-semibold">Patient Outcomes</h2>
                    <p className="mt-2 text-textSecondary">
                        Real stories from families and clinicians using HealthBridge.
                    </p>
                    <div className="mt-6 grid md:grid-cols-3 gap-6">
                        {testimonials.map((item) => (
                            <div key={item.name} className="rounded-lg border border-white/10 bg-secondary p-5">
                                <p className="text-sm text-textSecondary">"{item.quote}"</p>
                                <div className="mt-4 text-sm font-semibold">{item.name}</div>
                                <div className="text-xs text-faith">{item.outcome}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-10 sm:py-12">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-2xl font-semibold">Stay connected</h2>
                        <p className="mt-2 text-textSecondary">
                            Get alerts when new services, doctors, and care programs become available.
                        </p>
                        <form onSubmit={subscribe} className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <input
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                type="email"
                                required
                                placeholder="Your email address"
                                className="flex-1 rounded-md bg-white/5 border border-white/20 px-4 py-3"
                            />
                            <button type="submit" className="virtua-button bg-faith text-black w-full sm:w-auto">
                                Join updates
                            </button>
                        </form>
                        {status && <div className="mt-2 text-sm text-textSecondary">{status}</div>}
                    </div>
                    <div className="rounded-lg border border-white/10 bg-secondary p-6">
                        <h3 className="text-lg font-semibold">Transparent pricing</h3>
                        <p className="mt-2 text-sm text-textSecondary">
                            View clear pricing tiers for virtual consults, follow-ups, and pharmacy deliveries.
                        </p>
                        <NavLink to="/faq-pricing" className="mt-4 inline-flex virtua-button">
                            View pricing guide
                        </NavLink>
                    </div>
                </div>
            </section>
        </>
    );
}
