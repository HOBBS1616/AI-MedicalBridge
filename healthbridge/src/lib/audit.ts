import { getJson, setJson } from "./storage";

export type AuditEvent = {
    id: string;
    action: string;
    detail: string;
    createdAt: string;
};

const KEY = "hb_audit";

export function logAudit(action: string, detail: string) {
    const list = getJson<AuditEvent[]>(KEY, []);
    const id = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const item: AuditEvent = { id, action, detail, createdAt: new Date().toISOString() };
    list.unshift(item);
    setJson(KEY, list.slice(0, 200));
}

export function getAuditEvents() {
    return getJson<AuditEvent[]>(KEY, []);
}
