export type Service = {
    name: string;
    description: string;
    link: string;
};

export const services: Service[] = [
    {
        name: "Symptom Analysis",
        description: "Chat with our AI assistant to understand your symptoms and get guidance.",
        link: "/symptoms",
    },
    {
        name: "Virtual Consult",
        description: "Book an online consultation with a licensed doctor.",
        link: "/virtual-consult",
    },
    {
        name: "Find a Doctor",
        description: "Search for specialists and general practitioners near you.",
        link: "/find-doctor",
    },
    {
        name: "Locations",
        description: "Find our hospital branches and partner clinics.",
        link: "/locations",
    },
    {
        name: "Patients & Visitors",
        description: "Information for patients, families, and visitors.",
        link: "/patients-visitors",
    },
    {
        name: "About Us",
        description: "Learn more about our mission, vision, and values.",
        link: "/about",
    },
];
