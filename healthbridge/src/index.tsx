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
import PatientPortalPage from "./pages/PatientPortalPage";
import StaffPortalPage from "./pages/StaffPortalPage";
import EmergencyRequestPage from "./pages/EmergencyRequestPage";
import EmergencyQueuePage from "./pages/EmergencyQueuePage";
import HmoCoveragePage from "./pages/HmoCoveragePage";
import TrustSafetyPage from "./pages/TrustSafetyPage";
import LabRequestPage from "./pages/LabRequestPage";
import LabQueuePage from "./pages/LabQueuePage";
import NurseVisitPage from "./pages/NurseVisitPage";
import NurseDispatchPage from "./pages/NurseDispatchPage";
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
          <Route path="hmo-coverage" element={<HmoCoveragePage />} />
          <Route path="trust" element={<TrustSafetyPage />} />
          <Route path="tests" element={<LabRequestPage />} />
          <Route path="nurse-visit" element={<NurseVisitPage />} />
          <Route
            path="patients"
            element={
              <RequireRole roles={["doctor", "admin"]}>
                <PatientListPage />
              </RequireRole>
            }
          />
          <Route
            path="records"
            element={
              <RequireRole roles={["admin"]}>
                <PatientRecordsPage />
              </RequireRole>
            }
          />
          <Route
            path="dashboard"
            element={
              <RequireRole roles={["doctor", "admin"]}>
                <DashboardPage />
              </RequireRole>
            }
          />
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
          <Route
            path="patient"
            element={
              <RequireRole roles={["patient"]}>
                <PatientPortalPage />
              </RequireRole>
            }
          />
          <Route
            path="staff"
            element={
              <RequireRole roles={["doctor", "admin"]}>
                <StaffPortalPage />
              </RequireRole>
            }
          />
          <Route path="emergency" element={<EmergencyRequestPage />} />
          <Route
            path="emergency-queue"
            element={
              <RequireRole roles={["doctor", "admin"]}>
                <EmergencyQueuePage />
              </RequireRole>
            }
          />
          <Route
            path="lab-queue"
            element={
              <RequireRole roles={["doctor", "admin"]}>
                <LabQueuePage />
              </RequireRole>
            }
          />
          <Route
            path="nurse-dispatch"
            element={
              <RequireRole roles={["doctor", "admin"]}>
                <NurseDispatchPage />
              </RequireRole>
            }
          />
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
