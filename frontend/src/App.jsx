import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';


const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="pt-16 sm:pt-20">{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <ThemeProvider>
      
        <BrowserRouter>
          <ScrollToTop />
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
            <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
            <Route path="/terms-of-service" element={<PublicLayout><TermsOfServicePage /></PublicLayout>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
