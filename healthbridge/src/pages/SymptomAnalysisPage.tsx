import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import conditions from "../data/conditions.json";
import { addNotification } from "../lib/notifications";
import { logAudit } from "../lib/audit";

type Role = "bot" | "user" | "system";
type Message = { id: string; role: Role; text: string; choices?: string[]; done?: boolean };
type AnswerMap = Record<string, string>;

type Condition = {
    condition_id: string;
    name: string;
    icd_code: string;
    symptoms: { name: string; weight: number }[];
    risk_factors: string[];
    first_aid: string[];
    suggested_medications: { name: string; dosage: string; note: string }[];
    escalation: { red_flags: string[]; action: string };
    specialist: string;
};

type AnalysisResult = {
    diagnosis?: Condition;
    other?: Condition[];
    redFlag?: string;
};

type Step = {
    id: string;
    bot: string;
    type: "text" | "choice";
    choices?: string[];
    next: string | ((a: AnswerMap) => string);
};

export default function SymptomAnalysisPage() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const startedRef = useRef(false);
    const [consented, setConsented] = useState(
        () => localStorage.getItem("hb_ai_consent") === "1"
    );
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [showSummary, setShowSummary] = useState(false);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Steps (text + choices). Input shows only for type="text"
    const STEPS: Step[] = useMemo(
        () => [
            { id: "chief_complaint", bot: "What’s your main symptom today? (e.g., fever, cough, stomach pain)", type: "text", next: "duration" },
            {
                id: "duration",
                bot: "How long has this been going on?",
                type: "choice",
                choices: ["Less than a day", "1–3 days", "4–7 days", "More than a week"],
                next: "severity"
            },
            {
                id: "severity",
                bot: "How severe is it right now?",
                type: "choice",
                choices: ["Mild", "Moderate", "Severe"],
                next: (a: AnswerMap) => {
                    const cc = (a.chief_complaint || "").toLowerCase();
                    if (/headache/.test(cc)) return "headache_followup";
                    if (/fever/.test(cc)) return "fever_followup";
                    if (/cough/.test(cc)) return "cough_followup";
                    if (/stomach|abdominal|tummy|abdominal pain/.test(cc)) return "abdominal_followup";
                    return "associated_symptoms";
                }
            },
            { id: "headache_followup", bot: "Is the pain one-sided, both sides, or all over?", type: "choice", choices: ["One side", "Both sides", "All over", "Not sure"], next: "associated_symptoms" },
            { id: "fever_followup", bot: "Have you measured your temperature? If yes, what was the highest?", type: "choice", choices: ["Not measured", "37.5–38.0°C", "38.1–39.0°C", ">39.0°C"], next: "associated_symptoms" },
            { id: "cough_followup", bot: "Is your cough dry or producing phlegm?", type: "choice", choices: ["Dry", "Productive", "Not sure"], next: "associated_symptoms" },
            {
                id: "abdominal_followup",
                bot: "Where is the pain mostly located?",
                type: "choice",
                choices: ["Upper right", "Upper left", "Lower right", "Lower left", "Center", "All over", "Not sure"],
                next: "associated_symptoms"
            },
            { id: "associated_symptoms", bot: "Any other symptoms? (nausea, rash, chills, etc.)", type: "text", next: "history" },
            { id: "history", bot: "Any chronic conditions or allergies?", type: "text", next: "meds" },
            { id: "meds", bot: "Any current medications or supplements?", type: "text", next: "risk_factors" },
            { id: "risk_factors", bot: "Recent travel, sick contacts, injuries, or surgeries?", type: "text", next: "impact" },
            { id: "impact", bot: "How is this affecting your daily life?", type: "text", next: "END" }
        ],
        []
    );

    // Human-like streaming
    async function streamBot(text: string, opts?: Partial<Message>) {
        const id = crypto.randomUUID();
        setMessages((m) => [...m, { id, role: "bot", text: "", ...opts }]);
        const words = text.split(" ");
        for (let i = 0; i < words.length; i++) {
            await new Promise((r) => setTimeout(r, 35 + Math.random() * 80));
            setMessages((m) =>
                m.map((msg) => (msg.id === id ? { ...msg, text: msg.text + (i > 0 ? " " : "") + words[i] } : msg))
            );
        }
    }

    async function pushUser(text: string) {
        setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text }]);
    }

    // Start once (guard StrictMode)
    useEffect(() => {
        if (!consented) return;
        if (startedRef.current) return;
        startedRef.current = true;
        (async () => {
            await streamBot("Hi, I'm your HealthBridge assistant. I’ll ask a few questions and help you right here at home.");
            setCurrentId("chief_complaint");
            await streamBot(STEPS[0].bot);
        })();
    }, [STEPS, consented]);

    function tokenize(text: string) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s\-]/g, " ")
            .split(/\s+/)
            .filter(Boolean);
    }

    function scoreConditions(ans: AnswerMap) {
        const symptomText = `${ans.chief_complaint || ""} ${ans.associated_symptoms || ""}`.toLowerCase();
        const tokens = tokenize(symptomText);
        const rfText = (ans.risk_factors || "").toLowerCase();

        return (conditions as Condition[])
            .map((c) => {
                let score = 0;
                c.symptoms.forEach((s) => {
                    // match by token or phrase
                    const name = s.name.toLowerCase();
                    if (tokens.includes(name) || symptomText.includes(name)) score += s.weight;
                });
                // light boost if risk factor mentioned
                c.risk_factors.forEach((rf) => {
                    if (rfText.includes(rf.toLowerCase())) score += 0.2;
                });
                return { condition: c, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    }

    async function conclude(ans: AnswerMap) {
        await streamBot("Okay, give me a moment to put this together…");

        // Red flag check (string match)
        const combined = `${ans.chief_complaint || ""} ${ans.associated_symptoms || ""} ${ans.impact || ""}`.toLowerCase();
        const hitRedFlag = (conditions as Condition[]).find((c) =>
            c.escalation.red_flags.some((rf) => combined.includes(rf.toLowerCase()))
        );
        const redFlagText = hitRedFlag
            ? hitRedFlag.escalation.red_flags.find((rf) => combined.includes(rf.toLowerCase()))
            : undefined;

        if (hitRedFlag) {
            await streamBot(`I’m concerned about a serious sign: "${hitRedFlag.escalation.red_flags.find((rf) =>
                combined.includes(rf.toLowerCase())
            )}". ${hitRedFlag.escalation.action}.`);
        }

        const ranked = scoreConditions(ans);
        if (!ranked.length || ranked[0].score <= 0) {
            await streamBot("I couldn’t confidently match a diagnosis. Let’s book a quick consult so a doctor can review.");
            setAnalysis({ redFlag: redFlagText });
            addNotification({
                title: "Symptom analysis completed",
                body: "A doctor review is recommended for the next step.",
                type: "info",
            });
            logAudit("symptom_analysis_completed", "No confident diagnosis matched");
            return finishOptions();
        }

        const best = ranked[0].condition;
        const others = ranked.slice(1).map((r) => r.condition);

        await streamBot(`Diagnosis: ${best.name} (ICD: ${best.icd_code}).`);
        if (others.length) {
            await streamBot(`Other possibilities: ${others.map((c) => `${c.name} (ICD: ${c.icd_code})`).join(", ")}.`);
        }

        if (best.first_aid?.length) {
            await streamBot(`First aid: ${best.first_aid.join("; ")}.`);
        }
        if (best.suggested_medications?.length) {
            await streamBot(
                `Suggested medication: ${best.suggested_medications
                    .map((m) => `${m.name} — ${m.dosage}${m.note ? ` (${m.note})` : ""}`)
                    .join("; ")}.`
            );
        }

        await streamBot(`Recommended specialist: ${best.specialist}.`);
        setAnalysis({ diagnosis: best, other: others, redFlag: redFlagText });
        addNotification({
            title: "Symptom analysis completed",
            body: `Top match: ${best.name} (${best.icd_code}).`,
            type: "success",
        });
        logAudit("symptom_analysis_completed", `Top match ${best.name}`);

        finishOptions();
    }

    function finishOptions() {
        setMessages((m) => [
            ...m,
            {
                id: crypto.randomUUID(),
                role: "system",
                text: "",
                choices: ["View summary", "Print summary", "Download summary", "Book consult", "Find pharmacy", "Start over"]
            }
        ]);
        setCurrentId(null);
        setLoading(false);
    }

    async function handleAnswer(value: string) {
        if (!currentId) return;
        setLoading(true);
        await pushUser(value);

        const updated = { ...answers, [currentId]: value };
        setAnswers(updated);

        // human acks
        const acks = ["Got it.", "I hear you.", "Thanks — that helps.", "Okay."];
        await streamBot(acks[Math.floor(Math.random() * acks.length)]);

        const step = STEPS.find((s) => s.id === currentId)!;
        const next = typeof step.next === "function" ? step.next(updated) : step.next;

        if (next === "END") {
            await conclude(updated);
        } else {
            const nextStep = STEPS.find((s) => s.id === next)!;
            setCurrentId(nextStep.id);
            await streamBot(nextStep.bot, { choices: nextStep.choices });
            // hide keyboard input on choice steps
            if (nextStep.type === "choice") setInput("");
        }

        setLoading(false);
    }

    function handleSystem(choice: string) {
        if (choice === "Start over") {
            window.location.reload();
            return;
        }
        if (choice === "Book consult") {
            navigate("/find-doctor");
            return;
        }
        if (choice === "View summary") {
            setShowSummary(true);
            return;
        }
        if (choice === "Print summary") {
            printSummary();
            return;
        }
        if (choice === "Find pharmacy") {
            const location = window.prompt("Enter your location (area/city):");
            if (location) {
                const summary = buildTextSummary(messages, answers);
                // Here you’d call your backend to email pharmacies. For now, confirm to user:
                alert(`We’ll notify a partner pharmacy near "${location}" with your medication needs for delivery.`);
            }
            return;
        }
        if (choice === "Download summary") {
            const text = buildTextSummary(messages, answers);
            const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "symptom_summary.txt";
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    function buildTextSummary(msgs: Message[], ans: AnswerMap) {
        const convo = msgs
            .filter((m) => m.role !== "system")
            .map((m) => `${m.role === "bot" ? "Assistant" : "You"}: ${m.text}`)
            .join("\n");
        const answerLines = Object.entries(ans)
            .map(([k, v]) => `- ${k.replace(/_/g, " ")}: ${v}`)
            .join("\n");
        return `Conversation:\n${convo}\n\nYour answers:\n${answerLines}\n`;
    }

    function buildSummaryHtml(ans: AnswerMap) {
        const answerLines = Object.entries(ans)
            .map(([k, v]) => `<li><strong>${k.replace(/_/g, " ")}:</strong> ${v}</li>`)
            .join("");
        const diagnosis = analysis?.diagnosis
            ? `${analysis.diagnosis.name} (ICD: ${analysis.diagnosis.icd_code})`
            : "Doctor review recommended";
        const other = analysis?.other?.length
            ? analysis.other.map((c) => `${c.name} (ICD: ${c.icd_code})`).join(", ")
            : "None";
        const redFlag = analysis?.redFlag ? analysis.redFlag : "None reported";
        return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>HealthBridge Summary</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
      h1 { margin-bottom: 4px; }
      .section { margin-top: 20px; }
      ul { padding-left: 18px; }
      .muted { color: #475569; }
    </style>
  </head>
  <body>
    <h1>Symptom Analysis Summary</h1>
    <div class="muted">${new Date().toLocaleString()}</div>
    <div class="section">
      <h2>Summary</h2>
      <p><strong>Top match:</strong> ${diagnosis}</p>
      <p><strong>Other possibilities:</strong> ${other}</p>
      <p><strong>Red flags:</strong> ${redFlag}</p>
    </div>
    <div class="section">
      <h2>Your answers</h2>
      <ul>${answerLines}</ul>
    </div>
    <div class="section muted">
      This summary does not replace professional medical advice.
    </div>
  </body>
</html>`;
    }

    function printSummary() {
        const html = buildSummaryHtml(answers);
        const popup = window.open("", "_blank", "width=900,height=700");
        if (!popup) return;
        popup.document.write(html);
        popup.document.close();
        popup.focus();
        popup.print();
    }

    const curStep = useMemo(() => (currentId ? STEPS.find((s) => s.id === currentId) : undefined), [STEPS, currentId]);

    if (!consented) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold">Symptom Analysis</h1>
                <div className="mt-6 rounded-lg border border-white/10 bg-secondary p-6 text-textSecondary">
                    <p className="text-white font-medium">Consent & Disclaimer</p>
                    <p className="mt-2 text-sm">
                        This tool provides general guidance and is not a medical diagnosis. If you have
                        severe symptoms, please seek emergency care immediately.
                    </p>
                    <p className="mt-2 text-sm">
                        By continuing, you agree to use this information as educational support and not
                        as a substitute for professional medical advice.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            localStorage.setItem("hb_ai_consent", "1");
                            setConsented(true);
                            addNotification({
                                title: "Consent accepted",
                                body: "You can now use symptom analysis.",
                                type: "success",
                            });
                        }}
                        className="mt-4 virtua-button bg-faith text-black"
                    >
                        I understand, continue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Symptom Analysis</h1>

            <div className="mt-6 space-y-3">
                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={
                            m.role === "user"
                                ? "flex justify-end"
                                : m.role === "system"
                                    ? "flex justify-center"
                                    : "flex justify-start"
                        }
                    >
                        <div
                            className={
                                "max-w-[90%] rounded-lg px-4 py-3 whitespace-pre-wrap " +
                                (m.role === "user" ? "bg-accent text-white" : m.role === "system" ? "bg-transparent" : "bg-secondary text-white")
                            }
                        >
                            {m.role !== "system" && m.text}

                            {m.choices && m.choices.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {m.choices.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => handleAnswer(c)}
                                            disabled={loading}
                                            className="rounded-md border border-white/20 px-3 py-1 text-sm hover:bg-white/10 disabled:opacity-60"
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-secondary rounded-lg px-4 py-3 text-white/70">Typing…</div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Show input only for text-type steps */}
            {curStep?.type === "text" && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const val = input.trim();
                        if (!val) return;
                        handleAnswer(val);
                        setInput("");
                    }}
                    className="mt-4 flex gap-2"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your answer..."
                        className="flex-1 rounded-md bg-white/5 border border-white/20 px-4 py-3 text-white placeholder:text-textSecondary"
                    />
                    <button type="submit" className="virtua-button">
                        Send
                    </button>
                </form>
            )}

            {showSummary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={() => setShowSummary(false)}
                    />
                    <div className="relative w-full max-w-2xl rounded-lg border border-white/10 bg-secondary p-6 text-white shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <h2 className="text-2xl font-semibold">Symptom Summary</h2>
                            <button
                                type="button"
                                onClick={() => setShowSummary(false)}
                                className="rounded-md border border-white/20 px-3 py-1 text-sm text-textSecondary hover:bg-white/10"
                            >
                                Close
                            </button>
                        </div>
                        <div className="mt-3 text-sm text-textSecondary">
                            <div>
                                <strong className="text-white">Top match:</strong>{" "}
                                {analysis?.diagnosis
                                    ? `${analysis.diagnosis.name} (ICD: ${analysis.diagnosis.icd_code})`
                                    : "Doctor review recommended"}
                            </div>
                            <div className="mt-2">
                                <strong className="text-white">Other possibilities:</strong>{" "}
                                {analysis?.other?.length
                                    ? analysis.other.map((c) => `${c.name} (ICD: ${c.icd_code})`).join(", ")
                                    : "None"}
                            </div>
                            <div className="mt-2">
                                <strong className="text-white">Red flags:</strong>{" "}
                                {analysis?.redFlag || "None reported"}
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-sm font-semibold text-white">Your answers</h3>
                            <ul className="mt-2 space-y-1 text-sm text-textSecondary">
                                {Object.entries(answers).map(([k, v]) => (
                                    <li key={k}>
                                        <strong className="text-white">{k.replace(/_/g, " ")}:</strong> {v}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={printSummary}
                                className="virtua-button bg-faith text-black"
                            >
                                Print Summary
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowSummary(false)}
                                className="rounded-md border border-white/20 px-4 py-2 text-sm text-textSecondary hover:bg-white/10"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
