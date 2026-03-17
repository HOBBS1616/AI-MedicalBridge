import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function VirtualConsultPage() {
    const [status, setStatus] = useState("Waiting for clinician");
    const [eta] = useState("~7 minutes");

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Virtual Consultation</h1>
            <p className="mt-2 text-textSecondary">
                Join the waiting room, confirm your details, and connect securely with your clinician.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="virtua-card p-6">
                    <h2 className="text-lg font-semibold">Waiting Room</h2>
                    <p className="mt-2 text-sm text-textSecondary">
                        Status: <span className="text-white">{status}</span>
                    </p>
                    <p className="mt-1 text-sm text-textSecondary">Estimated wait: {eta}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setStatus("Ready to join")}
                            className="virtua-button"
                        >
                            Check In
                        </button>
                        <NavLink to="/messages" className="virtua-button bg-faith text-black">
                            Open Chat
                        </NavLink>
                    </div>
                </div>

                <div className="virtua-card p-6">
                    <h2 className="text-lg font-semibold">Pre-Visit Note</h2>
                    <form className="mt-4 grid gap-4">
                        <input
                            type="text"
                            placeholder="Reason for visit"
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <textarea
                            rows={4}
                            placeholder="Notes for your clinician..."
                            className="rounded-md bg-white/5 border border-white/20 px-4 py-3"
                        />
                        <div className="flex gap-3">
                            <button type="button" className="virtua-button">
                                Join Video
                            </button>
                            <button type="button" className="rounded-md border border-white/20 px-4 py-2 text-sm text-textSecondary hover:bg-white/10">
                                Save Note
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
