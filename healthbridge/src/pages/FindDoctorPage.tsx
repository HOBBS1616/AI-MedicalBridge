import { doctors, type Doctor } from "../data/doctors";

export default function FindDoctorPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Find a Doctor</h1>
            <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {doctors.map((doc: Doctor) => (
                    <div key={doc.name} className="virtua-card">
                        <img src={doc.image} alt={doc.name} className="w-full h-40 object-cover rounded-md" />
                        <h3 className="mt-4 font-medium">{doc.name}</h3>
                        <p className="text-sm text-textSecondary">{doc.specialty}</p>
                        <p className="text-xs text-textSecondary">{doc.location}</p>
                        <button className="mt-4 virtua-button w-full">Book Virtual</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
