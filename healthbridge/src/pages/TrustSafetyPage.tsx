import { NavLink } from "react-router-dom";

const trustHighlights = [
    {
        title: "Clinical safety",
        detail: "Triage workflows follow clinician-reviewed protocols and escalation rules.",
    },
    {
        title: "Privacy-first",
        detail: "Data minimization, consent-first intake, and export/delete controls.",
    },
    {
        title: "24/7 escalation",
        detail: "Emergency requests are routed with clear SLA tracking and dispatch status.",
    },
    {
        title: "Audit-ready",
        detail: "Actions are logged for operational review and continuous improvement.",
    },
];

const complianceBadges = [
    "HIPAA-aligned workflows",
    "NDPR-ready data handling",
    "Role-based access control",
    "Encrypted transport",
];

const consentSteps = [
    {
        title: "Share only what is needed",
        detail: "We request the minimum information required for care decisions.",
    },
    {
        title: "Approve before we act",
        detail: "You can review recommendations before scheduling or dispatch.",
    },
    {
        title: "Control your records",
        detail: "Export or delete your data at any time from the privacy center.",
    },
];

export default function TrustSafetyPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Trust, Safety & Compliance</h1>
                    <p className="mt-2 text-textSecondary">
                        Built for clinical accountability, patient privacy, and transparent decision-making.
                    </p>
                </div>
                <NavLink to="/privacy" className="virtua-button bg-faith text-black">
                    Open privacy controls
                </NavLink>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                <div className="virtua-card">
                    <h2 className="text-xl font-semibold">Our care standards</h2>
                    <p className="mt-2 text-sm text-textSecondary">
                        HealthBridge is designed to keep patients safe while giving clinicians the tools to act fast.
                    </p>
                    <div className="mt-4 grid gap-3">
                        {trustHighlights.map((item) => (
                            <div key={item.title} className="rounded-lg border border-white/10 bg-primary/40 px-4 py-3">
                                <div className="text-sm font-semibold">{item.title}</div>
                                <div className="text-xs text-textSecondary">{item.detail}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="virtua-card">
                    <h3 className="text-lg font-semibold">Compliance & safeguards</h3>
                    <p className="mt-2 text-sm text-textSecondary">
                        We align with healthcare privacy frameworks and enforce strict access policies.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-textSecondary">
                        {complianceBadges.map((item) => (
                            <span key={item} className="rounded-full border border-white/20 px-3 py-1">
                                {item}
                            </span>
                        ))}
                    </div>
                    <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                        Care teams review every high-risk case within minutes. Emergency escalations trigger on-call response.
                    </div>
                </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                {consentSteps.map((step, index) => (
                    <div key={step.title} className="rounded-lg border border-white/10 bg-secondary p-5">
                        <div className="text-xs uppercase text-textSecondary">Consent step {index + 1}</div>
                        <div className="mt-2 text-lg font-semibold">{step.title}</div>
                        <p className="mt-2 text-sm text-textSecondary">{step.detail}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="rounded-lg border border-white/10 bg-secondary p-6">
                    <h3 className="text-lg font-semibold">Transparency pledge</h3>
                    <p className="mt-2 text-sm text-textSecondary">
                        We provide plain-language explanations for every recommendation and give you full visibility into
                        your care journey.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <div className="rounded-lg border border-white/10 px-4 py-3 text-sm text-textSecondary">
                            Clinician notes are available in your portal after every visit.
                        </div>
                        <div className="rounded-lg border border-white/10 px-4 py-3 text-sm text-textSecondary">
                            Emergency dispatch decisions are timestamped for review.
                        </div>
                        <div className="rounded-lg border border-white/10 px-4 py-3 text-sm text-textSecondary">
                            Data exports include a full activity log for accountability.
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-secondary p-6">
                    <h3 className="text-lg font-semibold">Need support?</h3>
                    <p className="mt-2 text-sm text-textSecondary">
                        Our compliance team can answer questions about privacy, consent, or data requests.
                    </p>
                    <div className="mt-4 space-y-2 text-sm">
                        <div className="text-textSecondary">Email: trust@healthbridge.care</div>
                        <a href="tel:+2349000000001" className="text-faith hover:underline">
                            Call: +234 900 000 0001
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
