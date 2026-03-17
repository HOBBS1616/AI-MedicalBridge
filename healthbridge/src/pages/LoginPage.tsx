import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setCurrentUser, type Role } from "../lib/auth";
import { addNotification } from "../lib/notifications";

export default function LoginPage() {
    const navigate = useNavigate();
    const [role, setRole] = useState<Role>("patient");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const onSubmit = (event: React.FormEvent) => {
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
                Choose your role to access the right tools and workflows.
            </p>
            <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-lg border border-white/10 bg-secondary p-6">
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
        </div>
    );
}
