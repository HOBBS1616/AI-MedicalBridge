import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";
import { getCurrentUser } from "../lib/auth";

type Patient = {
    patientId: string;
    name: string;
    email: string;
    phone: string;
    symptoms: string;
    preferredTime?: string;
    registeredAt: string;
};

export default function PatientRecordsPage() {
    const user = getCurrentUser();
    const [patients, setPatients] = useState<Patient[]>([]);

    useEffect(() => {
        if (user?.role !== "admin") return;
        fetch(`${API_BASE_URL}/api/patients`)
            .then((res) => res.json())
            .then((data) => setPatients(data))
            .catch((err) => console.error("Error fetching patients:", err));
    }, [user?.role]);

    if (user?.role !== "admin") {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold">Patient Records</h1>
                <p className="mt-2 text-textSecondary">
                    Admin access only. Please sign in with an admin role to view records.
                </p>
                <NavLink to="/login" className="mt-4 inline-block virtua-button bg-faith text-black">
                    Sign in as Admin
                </NavLink>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Patient Records</h1>
            <p className="mt-2 text-textSecondary">Administrative view of registered patient information.</p>
            <div className="mt-6 overflow-x-auto rounded-lg border border-white/10 bg-secondary">
                <table className="min-w-full text-sm">
                    <thead className="bg-primary text-white">
                        <tr>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Phone</th>
                            <th className="px-4 py-3 text-left">Symptoms</th>
                            <th className="px-4 py-3 text-left">Preferred Time</th>
                            <th className="px-4 py-3 text-left">Registered At</th>
                        </tr>
                    </thead>
                    <tbody className="text-white">
                        {patients.map((p) => (
                            <tr key={p.patientId} className="border-t border-white/10">
                                <td className="px-4 py-3 font-medium">{p.name}</td>
                                <td className="px-4 py-3 text-textSecondary">{p.email}</td>
                                <td className="px-4 py-3 text-textSecondary">{p.phone}</td>
                                <td className="px-4 py-3">{p.symptoms}</td>
                                <td className="px-4 py-3 text-textSecondary">{p.preferredTime || "-"}</td>
                                <td className="px-4 py-3 text-textSecondary">
                                    {new Date(p.registeredAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
