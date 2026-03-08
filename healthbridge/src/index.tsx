import "./i18n";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";

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
          <Route path="records" element={<PatientRecordsPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
