const faqs = [
    {
        question: "How quickly can I get a virtual consult?",
        answer: "Most consults start within 10-20 minutes depending on the queue and clinician availability.",
    },
    {
        question: "Can I request a follow-up appointment?",
        answer: "Yes. Use the Appointments page or the Care Plan page to schedule a follow-up with one click.",
    },
    {
        question: "How do you keep my health data private?",
        answer: "We store only essential data and give you control to download or delete it anytime in the Privacy Center.",
    },
    {
        question: "Do you support pharmacy delivery?",
        answer: "Yes. Clinicians can trigger pharmacy delivery and you can track the status in the Delivery page.",
    },
];

const pricing = [
    {
        tier: "Virtual Consult",
        price: "NGN 5,000",
        description: "15-20 minute visit with a clinician, same-day summary.",
    },
    {
        tier: "Follow-up Visit",
        price: "NGN 2,500",
        description: "Short follow-up for ongoing care or prescription checks.",
    },
    {
        tier: "Medication Delivery",
        price: "NGN 1,500+",
        description: "Pharmacy delivery coordination with live tracking.",
    },
];

export default function FaqPricingPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">FAQs & Pricing</h1>
            <p className="mt-2 text-textSecondary">
                Clear answers and transparent pricing for every step of your care.
            </p>

            <div className="mt-8 grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    {faqs.map((faq) => (
                        <details key={faq.question} className="rounded-lg border border-white/10 bg-secondary p-4">
                            <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                            <p className="mt-2 text-sm text-textSecondary">{faq.answer}</p>
                        </details>
                    ))}
                </div>
                <div className="rounded-lg border border-white/10 bg-secondary p-6">
                    <h2 className="text-xl font-semibold">Pricing overview</h2>
                    <div className="mt-4 space-y-4">
                        {pricing.map((item) => (
                            <div key={item.tier} className="rounded-md border border-white/10 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold">{item.tier}</div>
                                    <div className="text-faith font-semibold">{item.price}</div>
                                </div>
                                <p className="mt-2 text-sm text-textSecondary">{item.description}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-xs text-textSecondary">
                        Pricing may vary by region or specialty. Ask your clinician for a full quote before billing.
                    </p>
                </div>
            </div>
        </div>
    );
}
