import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { addNotification } from "../lib/notifications";
import { logAudit } from "../lib/audit";
import { setCurrentUser } from "../lib/auth";

export default function RegisterPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    const source = params.get("source"); // e.g. "telehealth"

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        const form = e.target as HTMLFormElement;
        const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
        const payload: Record<string, string | number> = { ...data };

        if (data.age === "") {
            delete payload.age;
        } else if (data.age !== undefined) {
            payload.age = Number(data.age);
        }

        if (!data.preferredTime) {
            delete payload.preferredTime;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/patients/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const body = await response.json();
                const patientName = body?.patient?.name || data.name || "Patient";
                setCurrentUser({
                    name: patientName,
                    email: String(data.email || ""),
                    role: "patient",
                });
                addNotification({
                    title: "New patient registered",
                    body: `${patientName} was added to the registry.`,
                    type: "success",
                });
                logAudit("patient_registered", `${patientName} registered via intake form`);
                navigate("/patients?success=1");
            } else {
                const err = await response.json();
                setErrorMessage(err.error || "Registration failed");
            }
        } catch (err) {
            console.error("Error:", err);
            setErrorMessage("Network error. Please try again.");
        }
    };

    return (
        <div className="container py-12">
            <h1 className="section-title">Create your account</h1>

            {source === "telehealth" && (
                <div className="bg-blue-100 text-blue-800 p-3 rounded mb-4">
                    📢 You’re booking a <strong>Telehealth consultation</strong>. Please complete your details below.
                </div>
            )}

            <form
                onSubmit={onSubmit}
                className="mt-6 card p-6 grid gap-4 md:grid-cols-2"
            >
                {errorMessage && (
                    <div className="bg-red-100 text-red-700 p-2 rounded md:col-span-2">
                        {errorMessage}
                    </div>
                )}

                <input
                    required
                    name="name"
                    placeholder="Full name"
                    className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                />
                <input
                    required
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                />
                <input
                    name="age"
                    type="number"
                    placeholder="Age"
                    className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                />
                <input
                    required
                    name="phone"
                    type="tel"
                    placeholder="Phone"
                    className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                />
                <textarea
                    required
                    name="symptoms"
                    placeholder="Describe your symptoms"
                    className="rounded-md bg-white/5 border border-white/20 px-4 py-3 md:col-span-2"
                />
                <input
                    type="datetime-local"
                    name="preferredTime"
                    className="rounded-md bg-white/5 border border-white/20 px-4 py-3 md:col-span-2"
                />
                <button className="cta-btn md:col-span-2">Create account</button>
            </form>
        </div>
    );
}
