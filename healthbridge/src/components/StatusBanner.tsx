import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/auth";
import { getStatusBanner, type StatusBannerState } from "../lib/status";

const statusStyles: Record<string, string> = {
    online: "bg-emerald-500/10 text-emerald-100 border-emerald-500/30",
    busy: "bg-amber-500/10 text-amber-100 border-amber-500/30",
    limited: "bg-orange-500/10 text-orange-100 border-orange-500/30",
    offline: "bg-rose-500/10 text-rose-100 border-rose-500/30",
};

const COLLAPSE_KEY = "hb_status_collapsed";

const getCollapsed = () => {
    if (typeof window === "undefined") return false;
    try {
        return window.localStorage.getItem(COLLAPSE_KEY) === "true";
    } catch {
        return false;
    }
};

export default function StatusBanner() {
    const [banner, setBanner] = useState<StatusBannerState>(getStatusBanner());
    const [collapsed, setCollapsed] = useState(getCollapsed);
    const user = getCurrentUser();

    useEffect(() => {
        const sync = () => setBanner(getStatusBanner());
        window.addEventListener("storage", sync);
        window.addEventListener("hb-status", sync);
        return () => {
            window.removeEventListener("storage", sync);
            window.removeEventListener("hb-status", sync);
        };
    }, []);

    const statusTone = statusStyles[banner.status] || statusStyles.online;

    return (
        <div className="border-b border-white/10">
            {collapsed ? (
                <div className={`px-4 py-2 text-xs ${statusTone} border-b`}>
                    <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold uppercase text-[11px]">Status</span>
                            <span className="rounded-full border border-current/30 px-2 py-0.5 text-[10px] uppercase">
                                {banner.status}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setCollapsed(false);
                                try {
                                    window.localStorage.setItem(COLLAPSE_KEY, "false");
                                } catch {
                                    // ignore storage failures
                                }
                            }}
                            className="rounded-full border border-current/40 px-3 py-1 text-[10px] uppercase tracking-wide"
                            aria-expanded="false"
                            aria-controls="status-panel"
                        >
                            Show status
                        </button>
                    </div>
                </div>
            ) : (
                <div className={`px-4 py-2 text-sm ${statusTone} border-b`} id="status-panel">
                    <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3 justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold uppercase text-xs">Status</span>
                            <span className="rounded-full border border-current/30 px-2 py-0.5 text-xs uppercase">
                                {banner.status}
                            </span>
                            <span>{banner.message}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/70">
                            <span>Wait time: {banner.waitTime}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setCollapsed(true);
                                    try {
                                        window.localStorage.setItem(COLLAPSE_KEY, "true");
                                    } catch {
                                        // ignore storage failures
                                    }
                                }}
                                className="rounded-full border border-current/40 px-3 py-1 text-[10px] uppercase tracking-wide"
                                aria-expanded="true"
                                aria-controls="status-panel"
                            >
                                Hide
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {banner.emergency.enabled && (
                <div className="bg-rose-600/20 border-b border-rose-500/40 px-4 py-2 text-sm text-rose-100">
                    <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3 justify-between">
                        <div className="font-semibold">Emergency: {banner.emergency.message}</div>
                        <a
                            href={`tel:${banner.emergency.hotline}`}
                            className="rounded-md border border-rose-200/40 px-3 py-1 text-xs uppercase tracking-wide"
                        >
                            Call {banner.emergency.hotline}
                        </a>
                    </div>
                </div>
            )}

            {user?.role && !collapsed && (user.role === "admin" || user.role === "doctor") && (
                <div className="bg-primary border-b border-white/10 px-4 py-1 text-xs text-textSecondary">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <span>Operations status is editable in the dashboard.</span>
                        <span>Last updated {new Date(banner.updatedAt).toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
