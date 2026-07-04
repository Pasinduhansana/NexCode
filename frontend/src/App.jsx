import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Public Pages
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProjectRequestPage from './pages/ProjectRequestPage';
import ShowcasePage from './pages/ShowcasePage';
import ProjectDetailPage from './pages/ProjectDetailPage';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';


const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="pt-16 sm:pt-20">{children}</main>
    <Footer />
  </>
);

const ScrollToTopOnRouteChange = () => {
  const location = useLocation();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const doScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    };

    // Try immediately, then again shortly after in case the next page renders async content.
    requestAnimationFrame(doScroll);
    setTimeout(doScroll, 50);
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <ThemeProvider>
      
        <BrowserRouter>
          <ScrollToTopOnRouteChange />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
            <Route path="/showcase" element={<PublicLayout><ShowcasePage /></PublicLayout>} />
            <Route path="/showcase/:slug" element={<PublicLayout><ProjectDetailPage /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
            <Route path="/start-project" element={<PublicLayout><ProjectRequestPage /></PublicLayout>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
