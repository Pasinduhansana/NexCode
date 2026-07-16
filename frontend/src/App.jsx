import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { Analytics } from "@vercel/analytics/react";
import PageSkeleton from "./components/PageSkeleton";

// Public Pages (lazy loaded)
const HomePage = lazy(() => import("./pages/HomePage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ProjectRequestPage = lazy(() => import("./pages/ProjectRequestPage"));
const ShowcasePage = lazy(() => import("./pages/ShowcasePage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import WhatsAppFloat from "./components/WhatsAppFloat";

// Ad Modal
import AdModal from "./components/AdModal";
import useAdModal from "./hooks/useAdModal";

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="pt-16 sm:pt-20">{children}</main>
    <Footer />
  </>
);

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
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Suspense fallback={<PageSkeleton />}>
                    <HomePage />
                  </Suspense>
                </PublicLayout>
              }
            />
            <Route
              path="/services"
              element={
                <PublicLayout>
                  <Suspense fallback={<PageSkeleton />}>
                    <ServicesPage />
                  </Suspense>
                </PublicLayout>
              }
            />
            <Route
              path="/showcase"
              element={
                <PublicLayout>
                  <Suspense fallback={<PageSkeleton />}>
                    <ShowcasePage />
                  </Suspense>
                </PublicLayout>
              }
            />
            <Route
              path="/showcase/:slug"
              element={
                <PublicLayout>
                  <Suspense fallback={<PageSkeleton />}>
                    <ProjectDetailPage />
                  </Suspense>
                </PublicLayout>
              }
            />
            <Route
              path="/about"
              element={
                <PublicLayout>
                  <Suspense fallback={<PageSkeleton />}>
                    <AboutPage />
                  </Suspense>
                </PublicLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <PublicLayout>
                  <Suspense fallback={<PageSkeleton />}>
                    <ContactPage />
                  </Suspense>
                </PublicLayout>
              }
            />
            <Route
              path="/start-project"
              element={
                <PublicLayout>
                  <Suspense fallback={<PageSkeleton />}>
                    <ProjectRequestPage />
                  </Suspense>
                </PublicLayout>
              }
            />
            <Route
              path="/privacy-policy"
              element={
                <PublicLayout>
                  <Suspense fallback={<PageSkeleton />}>
                    <PrivacyPolicyPage />
                  </Suspense>
                </PublicLayout>
              }
            />
            <Route
              path="/terms-of-service"
              element={
                <PublicLayout>
                  <Suspense fallback={<PageSkeleton />}>
                    <TermsOfServicePage />
                  </Suspense>
                </PublicLayout>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <WhatsAppFloat />
        </BrowserRouter>
      </ThemeProvider>
      <Analytics />
    </>
  );
}

export default App;
