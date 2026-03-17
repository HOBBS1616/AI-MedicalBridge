import { getJson, setJson } from "./storage";

export type NotificationItem = {
    id: string;
    title: string;
    body?: string;
    type?: "info" | "success" | "warning";
    createdAt: string;
};

const KEY = "hb_notifications";

function emitUpdate() {
    window.dispatchEvent(new Event("hb-notifications"));
}

export function getNotifications(): NotificationItem[] {
    return getJson<NotificationItem[]>(KEY, []);
}

export function addNotification(input: Omit<NotificationItem, "id" | "createdAt">) {
    const list = getNotifications();
    const id = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const item: NotificationItem = {
        id,
        createdAt: new Date().toISOString(),
        ...input,
    };
    list.unshift(item);
    setJson(KEY, list.slice(0, 50));
    emitUpdate();
}

export function clearNotifications() {
    setJson(KEY, []);
    emitUpdate();
}
