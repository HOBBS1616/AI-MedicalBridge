import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";

type BotMessage = {
    id: string;
    role: "bot" | "user";
    text: string;
};

type Action = {
    id: string;
    label: string;
    route?: string;
    requiresAuth?: boolean;
    roles?: Array<"patient" | "doctor" | "admin">;
    response: string;
};

export default function TelemedicineBot() {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<BotMessage[]>([]);

    useEffect(() => {
        if (!open || messages.length > 0) return;
        setMessages([
            {
                id: "welcome",
                role: "bot",
                text: "Hi, I am your HealthBridge assistant. I can guide you to the right place or help with next steps.",
            },
        ]);
    }, [open, messages.length]);

    const actions = useMemo<Action[]>(
        () => [
            {
                id: "book",
                label: "Book appointment",
                route: "/appointments",
                response: "Opening the appointment request page now.",
            },
            {
                id: "symptoms",
                label: "Run symptom analysis",
                route: "/symptoms",
                response: "Taking you to symptom analysis.",
            },
            {
                id: "care",
                label: "Open care plan",
                route: "/patient-profile",
                requiresAuth: true,
                response: "Opening your care plan.",
            },
            {
                id: "messages",
                label: "Send a message",
                route: "/messages",
                requiresAuth: true,
                response: "Opening secure messages.",
            },
            {
                id: "emergency",
                label: "Request ambulance",
                route: "/emergency",
                response: "Opening the emergency request form.",
            },
            {
                id: "share",
                label: "Share HealthBridge",
                route: "/share",
                response: "Opening the share page.",
            },
            {
                id: "triage",
                label: "Open triage board",
                route: "/triage",
                roles: ["doctor", "admin"],
                response: "Opening the triage board.",
            },
            {
                id: "staff",
                label: "Staff portal",
                route: "/staff",
                roles: ["doctor", "admin"],
                response: "Opening the staff portal.",
            },
        ],
        []
    );

    const handleAction = (action: Action) => {
        const id = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        setMessages((prev) => [...prev, { id, role: "user", text: action.label }]);

        const requiresRole = action.roles && action.roles.length > 0;
        if (requiresRole && (!user || !action.roles?.includes(user.role))) {
            setMessages((prev) => [
                ...prev,
                {
                    id: `${id}-bot`,
                    role: "bot",
                    text: "That area is for clinicians or admins. Please sign in with the right role.",
                },
            ]);
            navigate("/login");
            return;
        }

        if (action.requiresAuth && !user) {
            setMessages((prev) => [
                ...prev,
                {
                    id: `${id}-bot`,
                    role: "bot",
                    text: "Please sign in first so I can take you there.",
                },
            ]);
            navigate("/login");
            return;
        }

        setMessages((prev) => [
            ...prev,
            {
                id: `${id}-bot`,
                role: "bot",
                text: action.response,
            },
        ]);
        if (action.route) navigate(action.route);
    };

    return (
        <div className="fixed bottom-5 left-5 z-40">
            {open && (
                <div className="mb-3 w-80 rounded-lg border border-white/10 bg-secondary p-4 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Telemedicine Assistant</div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-xs text-textSecondary hover:text-white"
                        >
                            Close
                        </button>
                    </div>
                    <div className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`rounded-md px-3 py-2 ${
                                    msg.role === "user" ? "bg-accent text-white ml-8" : "bg-primary text-white mr-6"
                                }`}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 text-xs text-textSecondary">
                        I provide navigation guidance only. For emergencies, request an ambulance immediately.
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {actions.map((action) => (
                            <button
                                key={action.id}
                                type="button"
                                onClick={() => handleAction(action)}
                                className="rounded-full border border-white/20 px-3 py-1 text-xs text-textSecondary hover:bg-white/10"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="rounded-full bg-faith px-4 py-2 text-sm font-semibold text-black shadow-lg hover:opacity-90"
            >
                {open ? "Hide helper" : "Need help?"}
            </button>
        </div>
    );
}
