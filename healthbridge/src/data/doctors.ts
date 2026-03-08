export type Doctor = {
    name: string;
    specialty: string;
    location: string;
    image: string;
};

export const doctors: Doctor[] = [
    { name: "Dr. John Doe", specialty: "Cardiology", location: "Lagos", image: "/doctor1.jpg" },
    { name: "Dr. Jane Smith", specialty: "Pediatrics", location: "Abuja", image: "/doctor2.jpg" },
    { name: "Dr. Michael Johnson", specialty: "General Medicine", location: "Omu-Aran", image: "/doctor3.jpg" },
    { name: "Dr. Emily Brown", specialty: "Dermatology", location: "Lagos", image: "/doctor4.jpg" },
    { name: "Dr. David Wilson", specialty: "Neurology", location: "Abuja", image: "/doctor5.jpg" },
];
