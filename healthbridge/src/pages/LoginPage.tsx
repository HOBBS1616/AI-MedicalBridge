import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setCurrentUser, type Role } from "../lib/auth";
import { addNotification } from "../lib/notifications";
import { API_BASE_URL } from "../lib/api";

type Mode = "code" | "demo";

export default function LoginPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<Mode>("code");
    const [role, setRole] = useState<Role>("patient");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [status, setStatus] = useState("");
    const [step, setStep] = useState<"request" | "verify">("request");

    const requestCode = async (event: React.FormEvent) => {
        event.preventDefault();
        setStatus("");
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/request-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email }),
            });
            if (!res.ok) throw new Error("Unable to request code");
            const data = await res.json();
            if (data.code) {
                setStatus(`Dev code: ${data.code}`);
            } else {
                setStatus("Check your email for a verification code.");
            }
            setStep("verify");
        } catch (err) {
            console.error(err);
            setMode("demo");
            setStatus("Email login is unavailable. Use demo sign-in instead.");
        }
    };

    const verifyCode = async (event: React.FormEvent) => {
        event.preventDefault();
        setStatus("");
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/verify-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, code }),
            });
            if (!res.ok) throw new Error("Unable to verify code");
            const data = await res.json();
            setCurrentUser({
                name: data.user?.name || name,
                email: data.user?.email || email,
                role: data.user?.role || "patient",
                token: data.token,
            });
            addNotification({
                title: "Signed in",
                body: `Welcome back, ${data.user?.name || name}.`,
                type: "success",
            });
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setStatus("Verification failed. Try again or use demo sign-in.");
        }
    };

    const demoSignIn = (event: React.FormEvent) => {
        event.preventDefault();
        if (!name || !email) return;
        setCurrentUser({ name, email, role });
        addNotification({
            title: "Signed in",
            body: `Welcome back, ${name}. Role set to ${role}.`,
            type: "success",
        });
        navigate("/dashboard");
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="mt-2 text-textSecondary">
                Use secure email verification or switch to demo mode if email is unavailable.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <button
                    type="button"
                    onClick={() => setMode("code")}
                    className={`rounded-full px-4 py-1.5 ${mode === "code" ? "bg-white/10 text-white" : "text-textSecondary"}`}
                >
                    Email code
                </button>
                <button
                    type="button"
                    onClick={() => setMode("demo")}
                    className={`rounded-full px-4 py-1.5 ${mode === "demo" ? "bg-white/10 text-white" : "text-textSecondary"}`}
                >
                    Demo mode
                </button>
            </div>

            {mode === "code" ? (
                <form onSubmit={step === "request" ? requestCode : verifyCode} className="mt-6 grid gap-4 rounded-lg border border-white/10 bg-secondary p-6">
                    <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Full name"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        required
                    />
                    <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        type="email"
                        placeholder="Email"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        required
                    />
                    {step === "verify" && (
                        <input
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            placeholder="Verification code"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                            required
                        />
                    )}
                    <button type="submit" className="virtua-button bg-faith text-black">
                        {step === "request" ? "Send code" : "Verify & sign in"}
                    </button>
                    {status && <div className="text-sm text-textSecondary">{status}</div>}
                </form>
            ) : (
                <form onSubmit={demoSignIn} className="mt-6 grid gap-4 rounded-lg border border-white/10 bg-secondary p-6">
                    <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Full name"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        required
                    />
                    <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        type="email"
                        placeholder="Email"
                        className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        required
                    />
                    <div className="grid gap-2">
                        <label className="text-sm text-textSecondary">Role</label>
                        <select
                            value={role}
                            onChange={(event) => setRole(event.target.value as Role)}
                            className="rounded-md bg-secondary border border-white/20 px-3 py-2 text-white"
                        >
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="virtua-button bg-faith text-black">
                        Continue
                    </button>
                </form>
            )}
        </div>
    );
}
