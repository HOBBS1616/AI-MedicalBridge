import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";
import { getJson } from "../lib/storage";

type AuditEvent = { id: string; action: string; detail: string; createdAt: string };

export default function DashboardPage() {
    const [patientsCount, setPatientsCount] = useState(0);
    const [approvalsCount, setApprovalsCount] = useState(0);
    const [pharmacyCount, setPharmacyCount] = useState(0);
    const [audit, setAudit] = useState<AuditEvent[]>([]);
    const [status, setStatus] = useState("Checking backend...");

    useEffect(() => {
        const load = async () => {
            try {
                const [patientsRes, approvalsRes, pharmacyRes, auditRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/patients`),
                    fetch(`${API_BASE_URL}/api/debug/approvals`),
                    fetch(`${API_BASE_URL}/api/debug/pharmacy-requests`),
                    fetch(`${API_BASE_URL}/api/audit`),
                ]);
                if (!patientsRes.ok) throw new Error("Patients fetch failed");
                const patients = await patientsRes.json();
                const approvals = approvalsRes.ok ? await approvalsRes.json() : [];
                const pharmacy = pharmacyRes.ok ? await pharmacyRes.json() : [];
                const auditData = auditRes.ok ? await auditRes.json() : [];
                setPatientsCount(patients.length || 0);
                setApprovalsCount(approvals.length || 0);
                setPharmacyCount(pharmacy.length || 0);
                setAudit(auditData || []);
                setStatus("Backend online");
            } catch (err) {
                console.error(err);
                setStatus("Backend offline");
            }
        };
        load();
    }, []);

    const appointments = getJson("hb_appointments", []) as unknown[];
    const messages = getJson("hb_messages", []) as unknown[];

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="mt-2 text-textSecondary">{status}</p>
                </div>
                <NavLink to="/appointments" className="virtua-button bg-faith text-black">
                    New Appointment
                </NavLink>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="virtua-card">
                    <h3 className="text-sm text-textSecondary">Patients</h3>
                    <div className="mt-2 text-2xl font-semibold">{patientsCount}</div>
                </div>
                <div className="virtua-card">
                    <h3 className="text-sm text-textSecondary">Appointments</h3>
                    <div className="mt-2 text-2xl font-semibold">{appointments.length}</div>
                </div>
                <div className="virtua-card">
                    <h3 className="text-sm text-textSecondary">Messages</h3>
                    <div className="mt-2 text-2xl font-semibold">{messages.length}</div>
                </div>
                <div className="virtua-card">
                    <h3 className="text-sm text-textSecondary">Approvals</h3>
                    <div className="mt-2 text-2xl font-semibold">{approvalsCount}</div>
                </div>
                <div className="virtua-card">
                    <h3 className="text-sm text-textSecondary">Pharmacy Requests</h3>
                    <div className="mt-2 text-2xl font-semibold">{pharmacyCount}</div>
                </div>
                <div className="virtua-card">
                    <h3 className="text-sm text-textSecondary">Audit Events</h3>
                    <div className="mt-2 text-2xl font-semibold">{audit.length}</div>
                </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
                <div className="virtua-card">
                    <h2 className="text-xl font-semibold">Quick Actions</h2>
                    <div className="mt-4 grid gap-2 text-sm">
                        <NavLink to="/symptoms" className="hover:underline">Run symptom analysis</NavLink>
                        <NavLink to="/clinician" className="hover:underline">Approve a prescription</NavLink>
                        <NavLink to="/delivery" className="hover:underline">Track delivery status</NavLink>
                        <NavLink to="/messages" className="hover:underline">Send a secure message</NavLink>
                        <NavLink to="/privacy" className="hover:underline">Manage privacy data</NavLink>
                    </div>
                </div>
                <div className="virtua-card">
                    <h2 className="text-xl font-semibold">Recent Activity</h2>
                    {audit.length === 0 ? (
                        <p className="mt-3 text-textSecondary">No audit activity yet.</p>
                    ) : (
                        <ul className="mt-3 space-y-2 text-sm text-textSecondary">
                            {audit.slice(0, 5).map((item) => (
                                <li key={item.id}>
                                    <span className="text-white">{item.action}</span> • {item.detail}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
