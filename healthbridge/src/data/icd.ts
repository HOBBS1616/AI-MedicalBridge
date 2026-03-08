// src/data/icd.ts

export type ICD = {
    code: string
    description: string
    advice: string
}

// Extended ICD mapping for common issues
export const ICD_MAP: Record<string, ICD> = {
    headache: {
        code: "R51",
        description: "Headache",
        advice:
            "Stay hydrated, rest quietly, and consider over-the-counter pain relief. " +
            "Seek care if the pain is sudden, severe, or with neurological symptoms.",
    },
    fever: {
        code: "R50.9",
        description: "Fever, unspecified",
        advice:
            "Hydrate, rest, and monitor temperature. Seek urgent care for high fever, " +
            "rash, stiff neck, or confusion.",
    },
    cough: {
        code: "R05",
        description: "Cough",
        advice:
            "Use warm fluids and a humidifier. Seek care if cough >3 weeks, " +
            "with chest pain, blood, or breathing trouble.",
    },
    abdominal_pain: {
        code: "R10.9",
        description: "Abdominal pain, unspecified",
        advice:
            "Rest, hydrate, avoid heavy meals. Seek care if pain is severe, " +
            "localized with rebound, vomiting, or blood.",
    },
    chest_pain: {
        code: "R07.9",
        description: "Chest pain, unspecified",
        advice:
            "Chest pain can signal an emergency. Call emergency services or go to the ER immediately.",
    },
    shortness_of_breath: {
        code: "R06.02",
        description: "Shortness of breath",
        advice: "Difficulty breathing is a red flag. Seek emergency care right away.",
    },
    rash: {
        code: "R21",
        description: "Rash, unspecified",
        advice: "Keep the area clean. Seek care if rash is widespread, painful, or with fever.",
    },
}

// Red-flag combinations
export const RED_FLAGS: Array<{ conditions: string[]; message: string }> = [
    {
        conditions: ["chest_pain", "shortness_of_breath"],
        message:
            "Chest pain plus difficulty breathing may be life-threatening. " +
            "Please seek emergency care immediately.",
    },
    {
        conditions: ["fever", "rash", "stiff neck"],
        message:
            "Fever with rash and stiff neck could indicate meningitis. " +
            "Go to the ER or call emergency services now.",
    },
    {
        conditions: ["abdominal_pain", "vomiting", "blood"],
        message:
            "Severe abdominal pain with vomiting blood is an emergency. " +
            "Seek immediate medical attention.",
    },
]

// Utility to detect red flags
export function findRedFlag(answers: Record<string, string>): string | null {
    const keys = Object.keys(answers)
    for (const flag of RED_FLAGS) {
        const match = flag.conditions.every((c) => {
            return (
                keys.includes(c) ||
                Object.values(answers).some((v) => v.toLowerCase().includes(c))
            )
        })
        if (match) {
            return flag.message
        }
    }
    return null
}

// Compute ICD result based on chief complaint
export function computeICD(answers: Record<string, string>) {
    const cc = (answers.chief_complaint || "").toLowerCase()
    if (cc.includes("headache")) return ICD_MAP.headache
    if (cc.includes("fever")) return ICD_MAP.fever
    if (cc.includes("cough")) return ICD_MAP.cough
    if (cc.includes("abdominal") || cc.includes("stomach") || cc.includes("tummy"))
        return ICD_MAP.abdominal_pain
    if (cc.includes("chest pain")) return ICD_MAP.chest_pain
    if (cc.includes("shortness") || cc.includes("breath")) return ICD_MAP.shortness_of_breath
    if (cc.includes("rash")) return ICD_MAP.rash
    return null
}
