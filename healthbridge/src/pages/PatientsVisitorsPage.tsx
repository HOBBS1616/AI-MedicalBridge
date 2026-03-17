import { useEffect, useState } from "react";

type Resource = {
    title: string;
    desc: string;
    details: string[];
};

export default function PatientsVisitorsPage() {
    const resources: Resource[] = [
        {
            title: "Billing Information",
            desc: "Understand your bill, insurance coverage, and payment options.",
            details: [
                "Request an itemized bill at any time for transparent charges.",
                "We accept major insurance plans and offer self-pay options.",
                "Payment plans are available for qualifying patients.",
                "Contact billing support within 30 days for questions or corrections.",
            ],
        },
        {
            title: "Visitor Policy",
            desc: "Safe, supportive visits that respect patient rest and privacy.",
            details: [
                "Visiting hours: 10:00 AM - 8:00 PM daily, with quiet hours after 7:00 PM.",
                "Two visitors at a time for in-patient rooms to reduce crowding.",
                "Please delay visits if you have fever, cough, or recent exposure.",
                "Children under 12 may visit with adult supervision at the care team’s discretion.",
                "Respect patient privacy by keeping noise low and phones on silent.",
            ],
        },
        {
            title: "Patient Rights",
            desc: "Know your rights, your care choices, and how we protect your dignity.",
            details: [
                "Clear explanations of diagnosis, treatment options, and costs.",
                "The right to consent or refuse care after understanding risks and benefits.",
                "Privacy and confidentiality of your health information.",
                "Access to your records and the ability to request corrections.",
                "Care that honors your faith, values, and cultural beliefs.",
            ],
        },
    ];
    const [active, setActive] = useState<Resource | null>(null);

    useEffect(() => {
        if (!active) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setActive(null);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [active]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Patients & Visitors</h1>
            <p className="mt-2 text-faith">"The Lord sustains him on his sickbed." – Psalm 41:3</p>
            <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {resources.map((r) => (
                    <button
                        key={r.title}
                        type="button"
                        onClick={() => setActive(r)}
                        className="virtua-card text-left hover:shadow-xl"
                    >
                        <h3 className="font-medium">{r.title}</h3>
                        <p className="mt-2 text-sm text-textSecondary">{r.desc}</p>
                        <div className="mt-4 text-sm text-faith">Read more</div>
                    </button>
                ))}
            </div>

            {active && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={() => setActive(null)}
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative w-full max-w-2xl rounded-lg border border-white/10 bg-secondary p-6 text-white shadow-xl"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <h2 className="text-2xl font-semibold">{active.title}</h2>
                            <button
                                type="button"
                                onClick={() => setActive(null)}
                                className="rounded-md border border-white/20 px-3 py-1 text-sm text-textSecondary hover:bg-white/10"
                                aria-label="Close"
                            >
                                Close
                            </button>
                        </div>
                        <p className="mt-2 text-sm text-textSecondary">{active.desc}</p>
                        <ul className="mt-4 space-y-2 text-sm text-textSecondary">
                            {active.details.map((detail) => (
                                <li key={detail}>{detail}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
