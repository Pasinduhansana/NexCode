import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiHome, HiMail, HiCode, HiPhone, HiMenu, HiX, HiLogout, HiUser, HiSparkles } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../utils/usePageTitle';
import logo from '../../assets/Logo.png';
import toast from 'react-hot-toast';

const navItems = [
  { icon: HiHome, label: 'Dashboard', path: '/admin' },
  { icon: HiMail, label: 'Inquiries', path: '/admin/inquiries' },
  { icon: HiCode, label: 'Projects', path: '/admin/projects' },
  { icon: HiSparkles, label: 'Showcase', path: '/admin/showcase' },
  { icon: HiPhone, label: 'Contact Messages', path: '/admin/contacts' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  usePageTitle(
    {
      '/admin': 'Admin Dashboard',
      '/admin/inquiries': 'Admin Inquiries',
      '/admin/projects': 'Admin Projects',
      '/admin/showcase': 'Admin Showcase',
      '/admin/contacts': 'Admin Contacts',
    }[location.pathname] || 'Admin Panel'
  );

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin-panel');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 sm:p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <img src={logo} alt="NexCode" className="w-9 h-9 rounded-xl object-cover bg-white" />
          <div>
            <div className="font-display font-bold text-white text-sm">NexCode</div>
            <div className="text-xs text-gray-400">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <HiUser size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">{admin?.name}</div>
            <div className="text-xs text-gray-400 truncate">{admin?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <HiLogout size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-dvh bg-gray-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 flex-shrink-0 flex-col bg-gray-900 border-r border-gray-800">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[85vw] max-w-xs bg-gray-900 z-50 border-r border-gray-800 overflow-y-auto"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <HiMenu size={20} />
          </button>
          <div className="text-sm text-gray-400 hidden lg:block">
            Welcome back, <span className="text-white font-medium">{admin?.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800">
              View Website
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-950 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
