import { NavLink } from "react-router-dom";

export default function HomePage() {
    return (
        <>
            <section className="virtua-hero">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <h1 className="text-4xl font-bold">
                            Healing with Faith and Technology – Here for Good, Here for You.
                        </h1>
                        <p className="mt-4 text-textSecondary">
                            "So do not fear, for I am with you; do not be dismayed, for I am your God." – Isaiah 41:10
                        </p>
                        <div className="mt-6 flex gap-3">
                            <NavLink to="/get-care-now" className="virtua-button">Get Care Now</NavLink>
                            <NavLink to="/find-doctor" className="virtua-button bg-faith text-black">Find a Doctor</NavLink>
                        </div>
                    </div>

                    {/* Ambulance animation placeholder */}
                    <div className="rounded-lg overflow-hidden h-64">
                        <video
                            src="/Ambulance.mp4" // Place ambulance.mp4 in public/
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </section>
        </>
    );
}
