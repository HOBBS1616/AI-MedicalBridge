import { useState } from "react";

export default function PrivacyPage() {
    const [status, setStatus] = useState("");

    const downloadData = () => {
        const data: Record<string, unknown> = {};
        Object.keys(localStorage)
            .filter((key) => key.startsWith("hb_"))
            .forEach((key) => {
                const value = localStorage.getItem(key);
                data[key] = value ? JSON.parse(value) : null;
            });
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "healthbridge-data.json";
        anchor.click();
        URL.revokeObjectURL(url);
        setStatus("Your data export has started.");
    };

    const deleteData = () => {
        Object.keys(localStorage)
            .filter((key) => key.startsWith("hb_"))
            .forEach((key) => localStorage.removeItem(key));
        setStatus("Local data cleared on this device.");
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Privacy & Data Controls</h1>
            <p className="mt-2 text-textSecondary">
                Manage your local HealthBridge data. For server-side requests, contact support.
            </p>

            <div className="mt-6 grid gap-4 rounded-lg border border-white/10 bg-secondary p-6">
                <div>
                    <h2 className="text-lg font-semibold">Download your data</h2>
                    <p className="mt-1 text-sm text-textSecondary">
                        Export your locally stored data (appointments, messages, preferences) as JSON.
                    </p>
                    <button onClick={downloadData} className="mt-3 virtua-button bg-faith text-black">
                        Download data
                    </button>
                </div>
                <div className="border-t border-white/10 pt-4">
                    <h2 className="text-lg font-semibold">Delete local data</h2>
                    <p className="mt-1 text-sm text-textSecondary">
                        This clears HealthBridge data stored in your browser. It does not affect server records.
                    </p>
                    <button
                        onClick={deleteData}
                        className="mt-3 rounded-md border border-red-500/40 px-4 py-2 text-sm text-red-200 hover:bg-red-500/10"
                    >
                        Clear local data
                    </button>
                </div>
                {status && <div className="rounded-md border border-white/10 bg-primary px-4 py-3 text-sm">{status}</div>}
            </div>
        </div>
    );
}
