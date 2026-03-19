import "./i18n";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import { initErrorTracking } from "./lib/errorTracking";

import HomePage from "./pages/HomePage";
import SymptomAnalysisPage from "./pages/SymptomAnalysisPage";
import FindDoctorPage from "./pages/FindDoctorPage";
import ServicesPage from "./pages/ServicesPage";
import LocationsPage from "./pages/LocationsPage";
import PatientsVisitorsPage from "./pages/PatientsVisitorsPage";
import GetCareNowPage from "./pages/GetCareNowPage";
import AboutUsPage from "./pages/AboutUsPage";
import VirtualConsultPage from "./pages/VirtualConsultPage";
import RegisterPage from "./pages/RegisterPage";
import PatientRecordsPage from "./pages/PatientRecordsPage";
import DashboardPage from "./pages/DashboardPage";
import PatientListPage from "./pages/PatientListPage";
import LoginPage from "./pages/LoginPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import MessagesPage from "./pages/MessagesPage";
import ClinicianPage from "./pages/ClinicianPage";
import DeliveryTrackingPage from "./pages/DeliveryTrackingPage";
import PrivacyPage from "./pages/PrivacyPage";
import PatientProfilePage from "./pages/PatientProfilePage";
import TriageBoardPage from "./pages/TriageBoardPage";
import FaqPricingPage from "./pages/FaqPricingPage";
import SharePage from "./pages/SharePage";
import RequireRole from "./components/RequireRole";

initErrorTracking();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="symptoms" element={<SymptomAnalysisPage />} />
          <Route path="find-doctor" element={<FindDoctorPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="patients-visitors" element={<PatientsVisitorsPage />} />
          <Route path="get-care-now" element={<GetCareNowPage />} />
          <Route path="about" element={<AboutUsPage />} />
          <Route path="virtual-consult" element={<VirtualConsultPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="patients" element={<PatientListPage />} />
          <Route
            path="records"
            element={
              <RequireRole roles={["admin"]}>
                <PatientRecordsPage />
              </RequireRole>
            }
          />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route
            path="clinician"
            element={
              <RequireRole roles={["doctor", "admin"]}>
                <ClinicianPage />
              </RequireRole>
            }
          />
          <Route path="delivery" element={<DeliveryTrackingPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="patient-profile" element={<PatientProfilePage />} />
          <Route
            path="triage"
            element={
              <RequireRole roles={["doctor", "admin"]}>
                <TriageBoardPage />
              </RequireRole>
            }
          />
          <Route path="faq-pricing" element={<FaqPricingPage />} />
          <Route path="share" element={<SharePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
