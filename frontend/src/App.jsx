import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { Analytics } from "@vercel/analytics/react";


import HomePage from "./sitePages/HomePage";
import ServicesPage from "./sitePages/ServicesPage";
import AboutPage from "./sitePages/AboutPage";
import ContactPage from "./sitePages/ContactPage";
import ProjectRequestPage from "./sitePages/ProjectRequestPage";
import ShowcasePage from "./sitePages/ShowcasePage";
import ProjectDetailPage from "./sitePages/ProjectDetailPage";
import PrivacyPolicyPage from "./sitePages/PrivacyPolicyPage";
import TermsOfServicePage from "./sitePages/TermsOfServicePage";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import WhatsAppFloat from "./components/WhatsAppFloat";

// Ad Modal
import AdModal from "./components/AdModal";
import useAdModal from "./hooks/useAdModal";

// Admin
import { AdminAuthProvider } from "./Admin/context/AdminAuthContext";
import AdminLayout from "./Admin/components/AdminLayout";
import AdminLoginPage from "./Admin/pages/AdminLoginPage";
import AdminDashboardPage from "./Admin/pages/AdminDashboardPage";
import AdminProjectsPage from "./Admin/pages/AdminProjectsPage";
import AdminProjectDetailPage from "./Admin/pages/AdminProjectDetailPage";
import AdminKanbanPage from "./Admin/pages/AdminKanbanPage";
import AdminDesignerPage from "./Admin/pages/AdminDesignerPage";
import AdminFinancePage from "./Admin/pages/AdminFinancePage";
import AdminActivityPage from "./Admin/pages/AdminActivityPage";
import AdminAccessPage from "./Admin/pages/AdminAccessPage";
import AdminAssistantPage from "./Admin/pages/AdminAssistantPage";
import AdminReportingPage from "./Admin/pages/AdminReportingPage";

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="pt-16 sm:pt-20">{children}</main>
    <Footer />
  </>
);

const AppContent = () => {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <>
      <AdminAuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicLayout>
                  <HomePage />
              </PublicLayout>
            }
          />
          <Route
            path="/services"
            element={
              <PublicLayout>
                  <ServicesPage />
              </PublicLayout>
            }
          />
          <Route
            path="/showcase"
            element={
              <PublicLayout>
                  <ShowcasePage />
              </PublicLayout>
            }
          />
          <Route
            path="/showcase/:slug"
            element={
              <PublicLayout>
                  <ProjectDetailPage />
              </PublicLayout>
            }
          />
          <Route
            path="/about"
            element={
              <PublicLayout>
                  <AboutPage />
              </PublicLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <PublicLayout>
                  <ContactPage />
              </PublicLayout>
            }
          />
          <Route
            path="/start-project"
            element={
              <PublicLayout>
                  <ProjectRequestPage />
              </PublicLayout>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <PublicLayout>
                  <PrivacyPolicyPage />
              </PublicLayout>
            }
          />
          <Route
            path="/terms-of-service"
            element={
              <PublicLayout>
                  <TermsOfServicePage />
              </PublicLayout>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="projects" element={<AdminProjectsPage />} />
            <Route path="projects/:id" element={<AdminProjectDetailPage />} />
            <Route path="board" element={<AdminKanbanPage />} />
            <Route path="designer" element={<AdminDesignerPage />} />
            <Route path="finance" element={<AdminFinancePage />} />
            <Route path="activity" element={<AdminActivityPage />} />
            <Route path="access" element={<AdminAccessPage />} />
            <Route path="assistant" element={<AdminAssistantPage />} />
            <Route path="reporting" element={<AdminReportingPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>
      {!isAdminRoute && <WhatsAppFloat />}
    </>
  );
};

function App() {
  const { open, setOpen, startIndex } = useAdModal();

  return (
    <>
      <ThemeProvider>
        <BrowserRouter>
          <ScrollToTop />

          {/* <AdModal open={open} onClose={() => setOpen(false)} startIndex={startIndex} /> */}

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: "12px", fontFamily: "DM Sans, sans-serif", fontSize: "14px" },
            }}
          />
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
      <Analytics />
    </>
  );
}

export default App;
