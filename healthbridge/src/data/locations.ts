export type Location = {
    name: string;
    address: string;
    hours: string;
    image: string;
};

export const locations: Location[] = [
    { name: "Lagos Clinic", address: "123 Health St, Lagos", hours: "9 AM - 5 PM", image: "/location1.jpg" },
    { name: "Abuja Center", address: "456 Care Rd, Abuja", hours: "8 AM - 6 PM", image: "/location2.jpg" },
    { name: "Omu-Aran Branch", address: "789 Wellness Ave, Omu-Aran", hours: "10 AM - 4 PM", image: "/location3.jpg" },
    { name: "Virtual Global", address: "Online Worldwide", hours: "24/7", image: "/location4.jpg" },
];
