// src/pages/RegisterPage.tsx
import { useNavigate, useSearchParams } from "react-router-dom";
export default function RegisterPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const onSubmit = (e: React.FormEvent) => { e.preventDefault(); const data = Object.fromEntries(new FormData(e.target as HTMLFormElement)); localStorage.setItem("hb_user", JSON.stringify(data)); navigate(params.get("next") || "/dashboard"); };
    return (
        <div className="container py-12">
            <h1 className="section-title">Create your account</h1>
            <form onSubmit={onSubmit} className="mt-6 card p-6 grid gap-4 md:grid-cols-2">
                <input required name="name" className="rounded-md bg-white/5 border border-white/20 px-4 py-3" placeholder="Full name" />
                <input required name="email" type="email" className="rounded-md bg-white/5 border border-white/20 px-4 py-3" placeholder="Email" />
                <input name="age" type="number" className="rounded-md bg-white/5 border border-white/20 px-4 py-3" placeholder="Age" />
                <input name="phone" className="rounded-md bg-white/5 border border-white/20 px-4 py-3" placeholder="Phone" />
                <button className="cta-btn md:col-span-2">Create account</button>
            </form>
        </div>
    );
}
