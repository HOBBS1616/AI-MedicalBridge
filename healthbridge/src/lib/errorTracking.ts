import { API_BASE_URL } from "./api";
import { getJson, setJson } from "./storage";

export type ErrorEvent = {
    id: string;
    message: string;
    stack?: string;
    source?: string;
    createdAt: string;
};

const KEY = "hb_errors";

export function getLocalErrors() {
    return getJson<ErrorEvent[]>(KEY, []);
}

function recordError(event: Omit<ErrorEvent, "id" | "createdAt">) {
    const list = getLocalErrors();
    const id = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const next: ErrorEvent = {
        id,
        createdAt: new Date().toISOString(),
        ...event,
    };
    list.unshift(next);
    setJson(KEY, list.slice(0, 100));
    void fetch(`${API_BASE_URL}/api/errors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
    }).catch(() => undefined);
}

export function initErrorTracking() {
    if (typeof window === "undefined") return;
    window.addEventListener("error", (event) => {
        recordError({
            message: event.message || "Unknown error",
            stack: event.error?.stack,
            source: event.filename,
        });
    });
    window.addEventListener("unhandledrejection", (event) => {
        const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
        recordError({
            message: `Unhandled promise rejection: ${reason}`,
            stack: event.reason?.stack,
        });
    });
}
