import { getJson, setJson } from "./storage";

export type StatusLevel = "online" | "busy" | "limited" | "offline";

export type EmergencyBanner = {
    enabled: boolean;
    message: string;
    hotline: string;
};

export type StatusBannerState = {
    status: StatusLevel;
    waitTime: string;
    message: string;
    updatedAt: string;
    emergency: EmergencyBanner;
};

const KEY = "hb_status_banner";

const DEFAULT_STATUS: StatusBannerState = {
    status: "online",
    waitTime: "Under 10 minutes",
    message: "Virtual care is available across all departments.",
    updatedAt: new Date().toISOString(),
    emergency: {
        enabled: false,
        message: "If this is an emergency, call your local emergency line immediately.",
        hotline: "+2348000000000",
    },
};

function emitStatusUpdate() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("hb-status"));
    }
}

export function getStatusBanner(): StatusBannerState {
    return getJson<StatusBannerState>(KEY, DEFAULT_STATUS);
}

export function setStatusBanner(next: StatusBannerState) {
    setJson(KEY, next);
    emitStatusUpdate();
}

export function patchStatusBanner(patch: Partial<StatusBannerState>) {
    const current = getStatusBanner();
    setStatusBanner({
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
        emergency: patch.emergency ? { ...current.emergency, ...patch.emergency } : current.emergency,
    });
}
