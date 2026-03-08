import React, { useEffect, useState } from "react";

interface Patient {
    patientId: string;
    name: string;
    email: string;
    phone: string;
    symptoms: string;
    preferredTime?: string;
    registeredAt: string;
}

export default function PatientListPage() {
    const [patients, setPatients] = useState<Patient[]>([]);

    useEffect(() => {
        fetch("http://localhost:5001/api/patients")
            .then((res) => res.json())
            .then((data) => setPatients(data))
            .catch((err) => console.error("Error fetching patients:", err));
    }, []);

    return (
        <div className="container py-12">
            <h1 className="section-title">Registered Patients</h1>
            <table className="mt-6 w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Phone</th>
                        <th className="border p-2">Symptoms</th>
                        <th className="border p-2">Preferred Time</th>
                        <th className="border p-2">Registered At</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map((p) => (
                        <tr key={p.patientId}>
                            <td className="border p-2">{p.name}</td>
                            <td className="border p-2">{p.email}</td>
                            <td className="border p-2">{p.phone}</td>
                            <td className="border p-2">{p.symptoms}</td>
                            <td className="border p-2">{p.preferredTime || "-"}</td>
                            <td className="border p-2">
                                {new Date(p.registeredAt).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
