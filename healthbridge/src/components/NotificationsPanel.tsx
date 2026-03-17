import { useEffect, useMemo, useState } from "react";
import { clearNotifications, getNotifications } from "../lib/notifications";

export default function NotificationsPanel() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState(getNotifications());

    const count = useMemo(() => notifications.length, [notifications]);

    useEffect(() => {
        const refresh = () => setNotifications(getNotifications());
        window.addEventListener("hb-notifications", refresh);
        window.addEventListener("storage", refresh);
        return () => {
            window.removeEventListener("hb-notifications", refresh);
            window.removeEventListener("storage", refresh);
        };
    }, []);

    useEffect(() => {
        if (open) {
            setNotifications(getNotifications());
        }
    }, [open]);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="rounded-md border border-white/20 px-3 py-1 text-sm text-white hover:bg-white/10"
                aria-expanded={open}
            >
                Notifications {count > 0 ? `(${count})` : ""}
            </button>
            {open && (
                <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-white/10 bg-secondary p-3 text-sm text-white shadow-xl">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Recent Updates</span>
                        <button
                            type="button"
                            onClick={() => {
                                clearNotifications();
                                setOpen(false);
                            }}
                            className="text-textSecondary hover:text-white"
                        >
                            Clear
                        </button>
                    </div>
                    {notifications.length === 0 ? (
                        <div className="mt-3 text-textSecondary">No notifications yet.</div>
                    ) : (
                        <ul className="mt-3 space-y-2">
                            {notifications.slice(0, 6).map((n) => (
                                <li key={n.id} className="rounded-md border border-white/10 p-2">
                                    <div className="font-medium">{n.title}</div>
                                    {n.body && <div className="text-textSecondary">{n.body}</div>}
                                    <div className="mt-1 text-xs text-textSecondary">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
