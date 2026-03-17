import { useNavigate } from "react-router-dom";

export default function GetCareNowPage() {
    const navigate = useNavigate();

    const options = [
        {
            title: "Telehealth",
            desc: "Connect with a doctor online.",
            action: () => navigate("/appointments")
        },
        {
            title: "Emergency",
            desc: "Call 911 or your local emergency number.",
            action: () => window.location.href = "tel:911"
        },
        {
            title: "Walk-in Clinic",
            desc: "Visit a nearby urgent care center.",
            action: () => navigate("/locations")
        },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Get Care Now</h1>
            <p className="mt-2 text-faith">
                "Is anyone among you sick? Let them call the elders..." – James 5:14-15
            </p>
            <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {options.map((o) => (
                    <button
                        key={o.title}
                        onClick={o.action}
                        className="virtua-card text-left w-full"
                    >
                        <h3 className="font-medium">{o.title}</h3>
                        <p className="mt-2 text-sm text-textSecondary">{o.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
