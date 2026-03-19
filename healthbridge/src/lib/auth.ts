import { getJson, setJson } from "./storage";

export type Role = "patient" | "doctor" | "admin";
export type UserProfile = {
    name: string;
    email: string;
    role: Role;
    token?: string;
};

const USER_KEY = "hb_user";

function emitAuthUpdate() {
    window.dispatchEvent(new Event("hb-auth"));
}

export function getCurrentUser(): UserProfile | null {
    return getJson<UserProfile | null>(USER_KEY, null);
}

export function setCurrentUser(profile: UserProfile) {
    setJson(USER_KEY, profile);
    emitAuthUpdate();
}

export function getAuthToken() {
    return getCurrentUser()?.token;
}

export function clearCurrentUser() {
    setJson(USER_KEY, null);
    emitAuthUpdate();
}
