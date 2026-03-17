import { useMemo } from "react";
import { getJson } from "../lib/storage";

type DeliveryData = {
    pharmacyId?: string;
    expectedDelivery?: string;
    requestId?: string;
    status?: string;
};

const KEY = "hb_last_delivery";

export default function DeliveryTrackingPage() {
    const delivery = getJson<DeliveryData | null>(KEY, null);

    const steps = useMemo(() => {
        const base = [
            { label: "Request sent", done: true },
            { label: "Pharmacy reviewing", done: true },
            { label: "Courier dispatched", done: delivery?.status === "accepted" || delivery?.status === "delivered" },
            { label: "Out for delivery", done: delivery?.status === "delivered" },
            { label: "Delivered", done: delivery?.status === "delivered" },
        ];
        return base;
    }, [delivery]);

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Medication Delivery Tracking</h1>
            <p className="mt-2 text-textSecondary">
                Track prescription delivery status and estimated arrival times.
            </p>

            <div className="mt-6 rounded-lg border border-white/10 bg-secondary p-6">
                {delivery ? (
                    <div className="space-y-2 text-sm text-textSecondary">
                        <div>Request ID: {delivery.requestId || "Pending"}</div>
                        <div>Pharmacy ID: {delivery.pharmacyId || "Pending"}</div>
                        <div>
                            Expected delivery:{" "}
                            {delivery.expectedDelivery ? new Date(delivery.expectedDelivery).toLocaleString() : "TBD"}
                        </div>
                    </div>
                ) : (
                    <div className="text-textSecondary">
                        No delivery requests yet. Ask a clinician to notify a pharmacy from the Clinician page.
                    </div>
                )}

                <div className="mt-6 space-y-3">
                    {steps.map((step, index) => (
                        <div key={step.label} className="flex items-center gap-3">
                            <div
                                className={`h-3 w-3 rounded-full ${
                                    step.done ? "bg-accent" : "bg-white/20"
                                }`}
                            />
                            <div className="text-sm">{index + 1}. {step.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
