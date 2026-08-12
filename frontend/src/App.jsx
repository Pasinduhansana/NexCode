import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { Analytics } from "@vercel/analytics/react";


import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProjectRequestPage from "./pages/ProjectRequestPage";
import ShowcasePage from "./pages/ShowcasePage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";

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
import AdminFinancePage from "./Admin/pages/AdminFinancePage";
import AdminActivityPage from "./Admin/pages/AdminActivityPage";

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
            <Route path="finance" element={<AdminFinancePage />} />
            <Route path="activity" element={<AdminActivityPage />} />
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
