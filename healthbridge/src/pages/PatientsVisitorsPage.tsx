export default function PatientsVisitorsPage() {
    const resources = [
        { title: "Billing Information", desc: "Understand your bill and payment options." },
        { title: "Visitor Policy", desc: "Guidelines for visiting loved ones." },
        { title: "Patient Rights", desc: "Know your rights and responsibilities." },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Patients & Visitors</h1>
            <p className="mt-2 text-faith">"The Lord sustains him on his sickbed." – Psalm 41:3</p>
            <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {resources.map((r) => (
                    <div key={r.title} className="virtua-card">
                        <h3 className="font-medium">{r.title}</h3>
                        <p className="mt-2 text-sm text-textSecondary">{r.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
