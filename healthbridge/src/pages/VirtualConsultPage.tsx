export default function VirtualConsultPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Virtual Consultation</h1>
            <p className="mt-2 text-textSecondary">
                Connect securely with your clinician. Share a brief note before joining.
            </p>

            <div className="mt-8 virtua-card p-6">
                <form className="grid gap-4">
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
                        <button type="button" className="virtua-button">Join Video</button>
                        <button type="button" className="virtua-button bg-faith text-black">Open Chat</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
