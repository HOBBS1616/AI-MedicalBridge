import { useEffect, useRef, useState } from "react";
import { getJson, setJson } from "../lib/storage";
import { addNotification } from "../lib/notifications";
import { logAudit } from "../lib/audit";

type Message = {
    id: string;
    sender: "you" | "care";
    text: string;
    createdAt: string;
};

const KEY = "hb_messages";

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>(() => getJson<Message[]>(KEY, []));
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setJson(KEY, messages);
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = (event: React.FormEvent) => {
        event.preventDefault();
        const text = input.trim();
        if (!text) return;
        const id = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        setMessages((prev) => [
            ...prev,
            { id, sender: "you", text, createdAt: new Date().toISOString() },
        ]);
        setInput("");
        addNotification({
            title: "Message sent",
            body: "Your care team will respond shortly.",
            type: "info",
        });
        logAudit("message_sent", text.slice(0, 120));
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Secure Messages</h1>
            <p className="mt-2 text-textSecondary">
                Your conversation with the care team is private and encrypted.
            </p>

            <div className="mt-6 rounded-lg border border-white/10 bg-secondary p-4">
                <div className="h-80 overflow-y-auto space-y-3 pr-2">
                    {messages.length === 0 ? (
                        <div className="text-textSecondary">No messages yet. Send a note to get started.</div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === "you" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                                        msg.sender === "you" ? "bg-accent text-white" : "bg-primary text-white"
                                    }`}
                                >
                                    <div>{msg.text}</div>
                                    <div className="mt-1 text-xs text-white/70">
                                        {new Date(msg.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>

                <form onSubmit={send} className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Write a message..."
                        className="flex-1 rounded-md bg-white/5 border border-white/20 px-4 py-3"
                    />
                    <button type="submit" className="virtua-button bg-faith text-black w-full sm:w-auto">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
