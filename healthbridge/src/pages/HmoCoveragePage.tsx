import { useState } from "react";
import { NavLink } from "react-router-dom";

const partnerHmOs = [
    "Reliance HMO",
    "AXA Mansard Health",
    "Leadway Health",
    "AAR Health",
    "Hygeia HMO",
    "HealthPlus",
];

const coverageHighlights = [
    {
        title: "Virtual consults",
        detail: "Primary care and follow-up visits via secure video or chat.",
    },
    {
        title: "Symptom triage",
        detail: "Structured intake and clinician summary for faster decisions.",
    },
    {
        title: "Lab coordination",
        detail: "Home sample pickup or partner lab referrals, based on your plan.",
    },
    {
        title: "Medication delivery",
        detail: "Pharmacy fulfillment and delivery tracking when covered.",
    },
    {
        title: "Home nursing",
        detail: "Schedule post-visit nursing support where approved.",
    },
];

export default function HmoCoveragePage() {
    const [hmo, setHmo] = useState("");
    const [memberId, setMemberId] = useState("");
    const [dob, setDob] = useState("");
    const [location, setLocation] = useState("");
    const [result, setResult] = useState<null | { status: "verified" | "review"; message: string }>(null);

    const checkEligibility = (event: React.FormEvent) => {
        event.preventDefault();
        const eligible = hmo && hmo !== "Other" && memberId.trim().length >= 6;
        if (eligible) {
            setResult({
                status: "verified",
                message: "Coverage looks active. We will confirm benefits before your appointment.",
            });
        } else {
            setResult({
                status: "review",
                message: "We need a quick manual review. A coordinator will follow up within 1 business day.",
            });
        }
    };

    const downloadSummary = () => {
        const summary = `HealthBridge HMO Coverage Summary\n\nPlan: ${hmo || "Not selected"}\nMember ID: ${memberId || "Not provided"}\nLocation: ${location || "Not provided"}\n\nCoverage highlights:\n- Virtual consults\n- Symptom triage\n- Lab coordination\n- Medication delivery\n- Home nursing\n\nThis summary is informational only. Final benefits depend on your HMO.`;
        const blob = new Blob([summary], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "healthbridge-coverage-summary.txt";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">HMO & Coverage</h1>
                    <p className="mt-2 text-textSecondary">
                        Verify eligibility, understand what is covered, and keep benefits ready for every visit.
                    </p>
                </div>
                <NavLink to="/faq-pricing" className="virtua-button bg-faith text-black">
                    View pricing guide
                </NavLink>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="virtua-card">
                    <h2 className="text-xl font-semibold">Eligibility check</h2>
                    <p className="mt-2 text-sm text-textSecondary">
                        Enter your HMO details to confirm coverage before booking a visit.
                    </p>
                    <form onSubmit={checkEligibility} className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="text-sm text-textSecondary sm:col-span-2">
                            HMO provider
                            <select
                                value={hmo}
                                onChange={(event) => setHmo(event.target.value)}
                                className="mt-2 w-full rounded-md bg-primary border border-white/20 px-3 py-2 text-sm"
                                required
                            >
                                <option value="">Select HMO</option>
                                {partnerHmOs.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                                <option value="Other">Other / Not listed</option>
                            </select>
                        </label>
                        <label className="text-sm text-textSecondary">
                            Member ID
                            <input
                                value={memberId}
                                onChange={(event) => setMemberId(event.target.value)}
                                className="mt-2 w-full rounded-md bg-white/5 border border-white/20 px-3 py-2"
                                placeholder="HMO123456"
                                required
                            />
                        </label>
                        <label className="text-sm text-textSecondary">
                            Date of birth
                            <input
                                type="date"
                                value={dob}
                                onChange={(event) => setDob(event.target.value)}
                                className="mt-2 w-full rounded-md bg-white/5 border border-white/20 px-3 py-2"
                                required
                            />
                        </label>
                        <label className="text-sm text-textSecondary sm:col-span-2">
                            City / State
                            <input
                                value={location}
                                onChange={(event) => setLocation(event.target.value)}
                                className="mt-2 w-full rounded-md bg-white/5 border border-white/20 px-3 py-2"
                                placeholder="Lagos, NG"
                                required
                            />
                        </label>
                        <button type="submit" className="virtua-button bg-faith text-black sm:col-span-2">
                            Check coverage
                        </button>
                    </form>

                    {result && (
                        <div
                            className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                                result.status === "verified"
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                                    : "border-amber-500/40 bg-amber-500/10 text-amber-100"
                            }`}
                        >
                            {result.message}
                        </div>
                    )}
                </div>

                <div className="virtua-card">
                    <h3 className="text-lg font-semibold">Coverage summary</h3>
                    <p className="mt-2 text-sm text-textSecondary">
                        Keep this summary handy for claims and approvals.
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-textSecondary">
                        {coverageHighlights.map((item) => (
                            <div key={item.title} className="rounded-md border border-white/10 px-3 py-2">
                                <div className="text-white font-semibold text-sm">{item.title}</div>
                                <div className="text-xs text-textSecondary">{item.detail}</div>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={downloadSummary}
                        className="virtua-button mt-4 w-full"
                    >
                        Download summary
                    </button>
                </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-secondary p-5">
                    <h3 className="text-lg font-semibold">HMO claim flow</h3>
                    <ol className="mt-3 space-y-2 text-sm text-textSecondary">
                        <li>Share your HMO details during booking.</li>
                        <li>We validate coverage and confirm benefits.</li>
                        <li>Clinicians submit the visit summary.</li>
                        <li>Your HMO processes the claim.</li>
                    </ol>
                </div>
                <div className="rounded-lg border border-white/10 bg-secondary p-5">
                    <h3 className="text-lg font-semibold">Need help?</h3>
                    <p className="mt-2 text-sm text-textSecondary">
                        Our coverage coordinators can verify benefits and provide pre-authorization support.
                    </p>
                    <div className="mt-4 space-y-2 text-sm">
                        <div className="text-textSecondary">Email: coverage@healthbridge.care</div>
                        <a href="tel:+2349000000000" className="text-faith hover:underline">
                            Call: +234 900 000 0000
                        </a>
                    </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-secondary p-5">
                    <h3 className="text-lg font-semibold">Partner HMOs</h3>
                    <p className="mt-2 text-sm text-textSecondary">
                        Add your provider and we will confirm the network within 24 hours.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-textSecondary">
                        {partnerHmOs.map((item) => (
                            <span key={item} className="rounded-full border border-white/20 px-3 py-1">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
