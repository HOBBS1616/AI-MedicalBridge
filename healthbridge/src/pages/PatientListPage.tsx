import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";
import { getJson, setJson } from "../lib/storage";

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [params] = useSearchParams();
    const showSuccess = params.get("success") === "1";
    const [query, setQuery] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [followUps, setFollowUps] = useState<Record<string, boolean>>(
        () => getJson<Record<string, boolean>>("hb_followups", {})
    );
    const [followOnly, setFollowOnly] = useState(false);

    useEffect(() => {
        let active = true;
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`${API_BASE_URL}/api/patients`);
                if (!res.ok) {
                    throw new Error(`Request failed: ${res.status}`);
                }
                const data = await res.json();
                if (active) setPatients(data);
            } catch (err) {
                console.error("Error fetching patients:", err);
                if (active) setError("Unable to load patients. Please try again.");
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => {
            active = false;
        };
    }, []);

    const filteredPatients = useMemo(() => {
        const term = query.trim().toLowerCase();
        return patients.filter((p) => {
            const matchesQuery =
                !term ||
                p.name.toLowerCase().includes(term) ||
                p.email.toLowerCase().includes(term) ||
                p.phone.toLowerCase().includes(term);
            const registered = new Date(p.registeredAt).getTime();
            const fromOk = !dateFrom || registered >= new Date(dateFrom).getTime();
            const toOk = !dateTo || registered <= new Date(dateTo).getTime();
            const followOk = !followOnly || Boolean(followUps[p.patientId]);
            return matchesQuery && fromOk && toOk && followOk;
        });
    }, [patients, query, dateFrom, dateTo, followOnly, followUps]);

    const toggleFollowUp = (id: string) => {
        const next = { ...followUps, [id]: !followUps[id] };
        setFollowUps(next);
        setJson("hb_followups", next);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 text-white">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Registered Patients</h1>
                    <p className="text-sm text-textSecondary">
                        {loading ? "Loading patients..." : `${filteredPatients.length} total`}
                    </p>
                </div>
                <NavLink to="/register" className="virtua-button bg-faith text-black">
                    Add Patient
                </NavLink>
            </div>

            {showSuccess && (
                <div className="mt-4 rounded-md bg-faith text-black px-4 py-3 text-sm">
                    Registration saved. You can review the patient details below.
                </div>
            )}

            {error && (
                <div className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                </div>
            )}

            <div className="mt-6 grid gap-3 md:grid-cols-4">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search name, email, phone"
                    className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                />
                <input
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    type="date"
                    className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                />
                <input
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    type="date"
                    className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                />
                <label className="flex items-center gap-2 text-sm text-textSecondary">
                    <input
                        type="checkbox"
                        checked={followOnly}
                        onChange={(e) => setFollowOnly(e.target.checked)}
                        className="h-4 w-4"
                    />
                    Show follow-up only
                </label>
            </div>

            {!loading && !error && filteredPatients.length === 0 && (
                <div className="mt-8 rounded-lg border border-white/10 bg-secondary p-6 text-textSecondary">
                    No patients yet. Start by registering a new patient.
                </div>
            )}

            {!loading && !error && filteredPatients.length > 0 && (
                <div className="mt-6 overflow-x-auto rounded-lg border border-white/10 bg-secondary">
                    <table className="min-w-full text-sm">
                        <thead className="bg-primary text-white">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Name</th>
                                <th className="px-4 py-3 text-left font-semibold">Email</th>
                                <th className="px-4 py-3 text-left font-semibold">Phone</th>
                                <th className="px-4 py-3 text-left font-semibold">Symptoms</th>
                                <th className="px-4 py-3 text-left font-semibold">Follow-up</th>
                                <th className="px-4 py-3 text-left font-semibold">Preferred Time</th>
                                <th className="px-4 py-3 text-left font-semibold">Registered At</th>
                            </tr>
                        </thead>
                        <tbody className="text-white">
                            {filteredPatients.map((p) => (
                                <tr key={p.patientId} className="border-t border-white/10 hover:bg-white/5">
                                    <td className="px-4 py-3 font-medium">{p.name}</td>
                                    <td className="px-4 py-3 text-textSecondary">{p.email}</td>
                                    <td className="px-4 py-3 text-textSecondary">{p.phone}</td>
                                    <td className="px-4 py-3">{p.symptoms}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => toggleFollowUp(p.patientId)}
                                            className={`rounded-full border px-3 py-1 text-xs ${
                                                followUps[p.patientId]
                                                    ? "border-faith text-faith"
                                                    : "border-white/20 text-textSecondary"
                                            }`}
                                        >
                                            {followUps[p.patientId] ? "Needs follow-up" : "None"}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-textSecondary">{p.preferredTime || "-"}</td>
                                    <td className="px-4 py-3 text-textSecondary">
                                        {new Date(p.registeredAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
