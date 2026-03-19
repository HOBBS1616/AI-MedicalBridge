const WHATSAPP_NUMBER = "+2348000000000";
const SMS_NUMBER = "+2348000000000";

function normalizeNumber(num: string) {
    return num.replace(/[^\d]/g, "");
}

export default function ContactButtons() {
    const whatsappLink = `https://wa.me/${normalizeNumber(WHATSAPP_NUMBER)}`;
    const smsLink = `sms:${SMS_NUMBER}`;
    const telLink = `tel:${SMS_NUMBER}`;

    return (
        <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2">
            <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-emerald-400"
            >
                WhatsApp
            </a>
            <a
                href={smsLink}
                className="rounded-full bg-faith px-4 py-2 text-xs font-semibold text-black shadow-lg hover:opacity-90"
            >
                SMS
            </a>
            <a
                href={telLink}
                className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-white/10"
            >
                Call
            </a>
        </div>
    );
}
