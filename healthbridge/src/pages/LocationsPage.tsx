import { locations, type Location } from "../data/locations";

export default function LocationsPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Our Locations</h1>
            <p className="mt-2 text-faith">"I am the Lord, who heals you." – Exodus 15:26</p>
            <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {locations.map((loc: Location) => (
                    <div key={loc.name} className="virtua-card">
                        <img src={loc.image} alt={loc.name} className="w-full h-40 object-cover rounded-md" />
                        <h3 className="mt-4 font-medium">{loc.name}</h3>
                        <p className="text-sm text-textSecondary">{loc.address}</p>
                        <p className="text-xs text-textSecondary">{loc.hours}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
