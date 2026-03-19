import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";
import { getJson } from "../lib/storage";
import { addNotification } from "../lib/notifications";
import { getAuditEvents, logAudit } from "../lib/audit";
import { downloadCsv } from "../lib/csv";
import { getLocalErrors } from "../lib/errorTracking";
import { getStatusBanner, setStatusBanner, type StatusBannerState } from "../lib/status";

type AuditEvent = { id: string; action: string; detail: string; createdAt: string };

export default function DashboardPage() {
    const [patientsCount, setPatientsCount] = useState(0);
    const [approvalsCount, setApprovalsCount] = useState(0);
    const [pharmacyCount, setPharmacyCount] = useState(0);
    const [audit, setAudit] = useState<AuditEvent[]>([]);
    const [status, setStatus] = useState("Checking backend...");
    const [statusConfig, setStatusConfig] = useState<StatusBannerState>(getStatusBanner());
    const [errors, setErrors] = useState(getLocalErrors());

    useEffect(() => {
        const load = async () => {
            try {
                const [patientsRes, approvalsRes, pharmacyRes, auditRes, errorsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/patients`),
                    fetch(`${API_BASE_URL}/api/debug/approvals`),
                    fetch(`${API_BASE_URL}/api/debug/pharmacy-requests`),
                    fetch(`${API_BASE_URL}/api/audit`),
                    fetch(`${API_BASE_URL}/api/errors`),
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
                if (errorsRes.ok) {
                    const errorData = await errorsRes.json();
                    setErrors(errorData);
                }
                setStatus("Backend online");
            } catch (err) {
                console.error(err);
                setStatus("Backend offline");
            }
        };
        load();
    }, []);

    useEffect(() => {
        const sync = () => setStatusConfig(getStatusBanner());
        window.addEventListener("storage", sync);
        return () => window.removeEventListener("storage", sync);
    }, []);

    const appointments = getJson("hb_appointments", []) as unknown[];
    const messages = getJson("hb_messages", []) as unknown[];
    const localAudit = getAuditEvents();

    const updateStatus = (field: keyof StatusBannerState, value: string) => {
        const next = { ...statusConfig, [field]: value, updatedAt: new Date().toISOString() };
        setStatusConfig(next);
    };

    const updateEmergency = (field: keyof StatusBannerState["emergency"], value: string | boolean) => {
        const next = {
            ...statusConfig,
            emergency: { ...statusConfig.emergency, [field]: value },
            updatedAt: new Date().toISOString(),
        };
        setStatusConfig(next);
    };

    const saveStatus = () => {
        setStatusBanner(statusConfig);
        addNotification({
            title: "Status updated",
            body: "The public status banner has been refreshed.",
            type: "success",
        });
        logAudit("status_banner_updated", statusConfig.status);
    };

    const exportAudit = () => {
        downloadCsv("healthbridge-audit.csv", localAudit.map((item) => ({
            id: item.id,
            action: item.action,
            detail: item.detail,
            createdAt: item.createdAt,
        })));
    };

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
                        <NavLink to="/triage" className="hover:underline">Open triage board</NavLink>
                        <NavLink to="/clinician" className="hover:underline">Approve a prescription</NavLink>
                        <NavLink to="/delivery" className="hover:underline">Track delivery status</NavLink>
                        <NavLink to="/patient-profile" className="hover:underline">Update care plan</NavLink>
                        <NavLink to="/privacy" className="hover:underline">Manage privacy data</NavLink>
                    </div>
                </div>
                <div className="virtua-card">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Recent Activity</h2>
                        <button
                            type="button"
                            onClick={exportAudit}
                            className="rounded-md border border-white/20 px-3 py-1 text-xs text-textSecondary hover:bg-white/10"
                        >
                            Export CSV
                        </button>
                    </div>
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

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-secondary p-6">
                    <h2 className="text-xl font-semibold">Operations Center</h2>
                    <p className="mt-2 text-sm text-textSecondary">
                        Update the live banner and emergency messaging across the app.
                    </p>
                    <div className="mt-4 grid gap-3">
                        <select
                            value={statusConfig.status}
                            onChange={(e) => updateStatus("status", e.target.value)}
                            className="rounded-md bg-primary border border-white/20 px-3 py-2 text-white"
                        >
                            <option value="online">Online</option>
                            <option value="busy">Busy</option>
                            <option value="limited">Limited</option>
                            <option value="offline">Offline</option>
                        </select>
                        <input
                            value={statusConfig.waitTime}
                            onChange={(e) => updateStatus("waitTime", e.target.value)}
                            placeholder="Wait time"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <input
                            value={statusConfig.message}
                            onChange={(e) => updateStatus("message", e.target.value)}
                            placeholder="Status message"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <label className="flex items-center gap-2 text-sm text-textSecondary">
                            <input
                                type="checkbox"
                                checked={statusConfig.emergency.enabled}
                                onChange={(e) => updateEmergency("enabled", e.target.checked)}
                            />
                            Enable emergency banner
                        </label>
                        <input
                            value={statusConfig.emergency.message}
                            onChange={(e) => updateEmergency("message", e.target.value)}
                            placeholder="Emergency message"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <input
                            value={statusConfig.emergency.hotline}
                            onChange={(e) => updateEmergency("hotline", e.target.value)}
                            placeholder="Hotline number"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <button type="button" onClick={saveStatus} className="virtua-button bg-faith text-black">
                            Save banner
                        </button>
                    </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-secondary p-6">
                    <h2 className="text-xl font-semibold">Error Tracking</h2>
                    <p className="mt-2 text-sm text-textSecondary">
                        Capture client-side issues and monitor stability.
                    </p>
                    {errors.length === 0 ? (
                        <p className="mt-3 text-textSecondary">No client errors captured yet.</p>
                    ) : (
                        <ul className="mt-3 space-y-3 text-sm text-textSecondary max-h-64 overflow-y-auto pr-2">
                            {errors.slice(0, 6).map((err) => (
                                <li key={err.id} className="rounded-md border border-white/10 p-3">
                                    <div className="text-white font-semibold">{err.message}</div>
                                    <div className="text-xs">{new Date(err.createdAt).toLocaleString()}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
