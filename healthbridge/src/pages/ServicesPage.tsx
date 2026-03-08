import { services, type Service } from "../data/services";
import { NavLink } from "react-router-dom";

export default function ServicesPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Our Services</h1>
            <p className="mt-2 text-faith">
                "A joyful heart is good medicine." – Proverbs 17:22
            </p>

            <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {services.map((s: Service) => (
                    <div key={s.name} className="virtua-card flex flex-col justify-between">
                        <div>
                            <h3 className="font-medium">{s.name}</h3>
                            <p className="mt-2 text-sm text-textSecondary">{s.description}</p>
                        </div>
                        <NavLink
                            to={s.link}
                            className="virtua-button mt-4 self-start"
                        >
                            Start Now
                        </NavLink>
                    </div>
                ))}
            </div>
        </div>
    );
}
