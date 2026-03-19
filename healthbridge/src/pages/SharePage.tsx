import { useState } from "react";

export default function SharePage() {
    const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
    const [copied, setCopied] = useState(false);
    const message = `Check out HealthBridge - trusted virtual care for families: ${shareUrl}`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
    const smsLink = `sms:?&body=${encodeURIComponent(message)}`;

    const copyLink = async () => {
        if (!navigator.clipboard) return;
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Share HealthBridge</h1>
            <p className="mt-2 text-textSecondary">
                Invite family and friends to experience simple, faith-filled virtual care.
            </p>

            <div className="mt-6 rounded-lg border border-white/10 bg-secondary p-6">
                <div className="text-sm text-textSecondary">Share link</div>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                        value={shareUrl}
                        readOnly
                        className="flex-1 rounded-md bg-white/5 border border-white/20 px-4 py-3 text-sm"
                    />
                    <button type="button" onClick={copyLink} className="virtua-button bg-faith text-black">
                        {copied ? "Copied!" : "Copy link"}
                    </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-emerald-400/40 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-400/10"
                    >
                        Share on WhatsApp
                    </a>
                    <a
                        href={smsLink}
                        className="rounded-md border border-white/20 px-4 py-2 text-sm text-textSecondary hover:bg-white/10"
                    >
                        Share by SMS
                    </a>
                </div>
            </div>

            <div className="mt-6 rounded-lg border border-white/10 bg-secondary p-6 text-sm text-textSecondary">
                Suggested message:
                <div className="mt-2 text-white">{message}</div>
            </div>
        </div>
    );
}
