import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Logo from "./components/Logo";
import NotificationsPanel from "./components/NotificationsPanel";
import StatusBanner from "./components/StatusBanner";
import ContactButtons from "./components/ContactButtons";
import { clearCurrentUser, getCurrentUser } from "./lib/auth";

type NavItem = {
  to: string;
  label: string;
  end?: boolean;
};

export default function App() {
  const { i18n } = useTranslation();
  const [user, setUser] = useState(getCurrentUser());

  const publicPrimary = useMemo<NavItem[]>(
    () => [
      { to: "/", label: "Home", end: true },
      { to: "/services", label: "Services" },
      { to: "/find-doctor", label: "Find a Doctor" },
      { to: "/locations", label: "Locations" },
    ],
    []
  );

  const publicSecondary = useMemo<NavItem[]>(
    () => [
      { to: "/patients-visitors", label: "Patients & Visitors" },
      { to: "/faq-pricing", label: "FAQ & Pricing" },
      { to: "/about", label: "About" },
      { to: "/share", label: "Share" },
    ],
    []
  );

  const patientPrimary = useMemo<NavItem[]>(
    () => [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/symptoms", label: "Symptom Analysis" },
      { to: "/appointments", label: "Appointments" },
      { to: "/messages", label: "Messages" },
      { to: "/patient-profile", label: "Care Plan" },
    ],
    []
  );

  const patientSecondary = useMemo<NavItem[]>(
    () => [
      { to: "/delivery", label: "Delivery" },
      { to: "/privacy", label: "Privacy" },
      { to: "/faq-pricing", label: "FAQ & Pricing" },
      { to: "/share", label: "Share" },
    ],
    []
  );

  const clinicianPrimary = useMemo<NavItem[]>(
    () => [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/triage", label: "Triage Board" },
      { to: "/patients", label: "Patients" },
      { to: "/clinician", label: "Clinician" },
      { to: "/appointments", label: "Appointments" },
    ],
    []
  );

  const clinicianSecondary = useMemo<NavItem[]>(
    () => [
      { to: "/messages", label: "Messages" },
      { to: "/delivery", label: "Delivery" },
      { to: "/privacy", label: "Privacy" },
      { to: "/faq-pricing", label: "FAQ & Pricing" },
      { to: "/share", label: "Share" },
    ],
    []
  );

  const primaryLinks = useMemo<NavItem[]>(() => {
    if (!user) return publicPrimary;
    if (user.role === "patient") return patientPrimary;
    const adminExtra: NavItem[] = user.role === "admin" ? [{ to: "/records", label: "Records" }] : [];
    return [...clinicianPrimary, ...adminExtra];
  }, [user, publicPrimary, patientPrimary, clinicianPrimary]);

  const secondaryLinks = useMemo<NavItem[]>(() => {
    if (!user) return publicSecondary;
    if (user.role === "patient") return patientSecondary;
    return clinicianSecondary;
  }, [user, publicSecondary, patientSecondary, clinicianSecondary]);

  useEffect(() => {
    const sync = () => setUser(getCurrentUser());
    window.addEventListener("hb-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hb-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const navClass = (active: boolean, tone: "primary" | "secondary") => {
    const base = "rounded-full px-3 py-1.5 text-sm transition";
    if (active) {
      return `${base} bg-white/10 text-white`;
    }
    return tone === "primary"
      ? `${base} text-white/80 hover:text-white hover:bg-white/5`
      : `${base} text-textSecondary hover:text-white hover:bg-white/5`;
  };

  const showRegister = !user || user.role !== "patient";

  return (
    <div className="min-h-screen flex flex-col bg-primary text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 rounded-md bg-faith px-4 py-2 text-black"
      >
        Skip to content
      </a>
      <StatusBanner />
      <header className="border-b border-white/10 bg-primary backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-shrink-0">
              <Logo />
            </div>

            <div className="flex w-full flex-wrap items-center gap-3 justify-start sm:w-auto sm:justify-end">
              <NotificationsPanel />
              {user ? (
                <div className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-1 text-sm">
                  <span className="text-textSecondary">{user.name}</span>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs uppercase">{user.role}</span>
                  <button
                    type="button"
                    onClick={() => clearCurrentUser()}
                    className="text-textSecondary hover:text-white"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <NavLink to="/login" className="rounded-md border border-white/20 px-3 py-1 text-sm hover:bg-white/10">
                  Sign in
                </NavLink>
              )}

              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="bg-secondary text-white rounded px-2 py-1 text-sm"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
              </select>

              <NavLink to="/get-care-now" className="virtua-button">Get Care Now</NavLink>
              {showRegister && (
                <NavLink to="/register" className="virtua-button bg-faith text-black">Register</NavLink>
              )}
            </div>
          </div>

          <nav className="mt-4 space-y-2">
            <div className="flex gap-2 overflow-x-auto pb-2 whitespace-nowrap text-xs sm:text-sm -mx-4 px-4">
              {primaryLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => navClass(isActive, "primary")}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 whitespace-nowrap text-xs sm:text-sm -mx-4 px-4">
              {secondaryLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => navClass(isActive, "secondary")}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1 pb-12">
        <Outlet />
      </main>

      <footer className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6 text-sm text-textSecondary">
          <p>(c) {new Date().getFullYear()} HealthBridge Virtual Hospital</p>
          <div className="flex gap-4 justify-start md:justify-end">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Accessibility</a>
            <a href="#" className="hover:underline">Faith & Care</a>
          </div>
        </div>
      </footer>
      <ContactButtons />
    </div>
  );
}
