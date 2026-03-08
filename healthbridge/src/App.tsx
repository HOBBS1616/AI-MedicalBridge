import { NavLink, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "./components/Logo";

// Import your pages
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import SymptomAnalysisPage from "./pages/SymptomAnalysisPage";
import GetCareNowPage from "./pages/GetCareNowPage";
import RegisterPage from "./pages/RegisterPage";
import PatientListPage from "./pages/PatientListPage";

// Temporary placeholder pages
function VirtualConsultPage() {
  return <div className="p-6">Virtual Consult (Coming Soon)</div>;
}
function FindDoctorPage() {
  return <div className="p-6">Find a Doctor (Coming Soon)</div>;
}
function LocationsPage() {
  return <div className="p-6">Locations (Coming Soon)</div>;
}
function PatientsVisitorsPage() {
  return <div className="p-6">Patients & Visitors (Coming Soon)</div>;
}
function AboutPage() {
  return <div className="p-6">About Us (Coming Soon)</div>;
}

export default function App() {
  const { i18n } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-primary text-white">
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-6">
          <div className="flex-shrink-0">
            <Logo />
          </div>

          <nav className="flex gap-5 text-sm items-center">
            <NavLink to="/" className="hover:underline">Home</NavLink>
            <NavLink to="/services" className="hover:underline">Services</NavLink>
            <NavLink to="/find-doctor" className="hover:underline">Find a Doctor</NavLink>
            <NavLink to="/locations" className="hover:underline">Locations</NavLink>
            <NavLink to="/patients-visitors" className="hover:underline">Patients & Visitors</NavLink>
            <NavLink to="/about" className="hover:underline">About</NavLink>

            {/* Language selector */}
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="bg-secondary text-white rounded px-2 py-1 text-sm"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
          </nav>

          <div className="flex gap-3">
            <NavLink to="/get-care-now" className="virtua-button">Get Care Now</NavLink>
            <NavLink to="/register" className="virtua-button bg-faith text-black">Register</NavLink>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/symptoms" element={<SymptomAnalysisPage />} />
          <Route path="/virtual-consult" element={<VirtualConsultPage />} />
          <Route path="/find-doctor" element={<FindDoctorPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/patients-visitors" element={<PatientsVisitorsPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* New routes */}
          <Route path="/get-care-now" element={<GetCareNowPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/patients" element={<PatientListPage />} />
        </Routes>
      </main>

      <footer className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6 text-sm text-textSecondary">
          <p>© {new Date().getFullYear()} HealthBridge Virtual Hospital</p>
          <div className="flex gap-4 justify-start md:justify-end">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Accessibility</a>
            <a href="#" className="hover:underline">Faith & Care</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
