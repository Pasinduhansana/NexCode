import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Public Pages
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProjectRequestPage from './pages/ProjectRequestPage';
import ShowcasePage from './pages/ShowcasePage';
import ProjectDetailPage from './pages/ProjectDetailPage';

// Admin Pages
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminInquiries from './admin/AdminInquiries';
import AdminProjects from './admin/AdminProjects';
import AdminContacts from './admin/AdminContacts';
import AdminShowcase from './admin/AdminShowcase';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/admin-panel" replace />;
};

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
      <AuthProvider>
        <BrowserRouter>
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

            {/* Admin Routes */}
            <Route path="/admin-panel" element={<AdminLogin />} />
            <Route path="/admin/login" element={<Navigate to="/admin-panel" replace />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="inquiries" element={<AdminInquiries />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="showcase" element={<AdminShowcase />} />
              <Route path="contacts" element={<AdminContacts />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
