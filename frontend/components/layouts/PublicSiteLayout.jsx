"use client";

import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import ScrollToTop from "@/src/components/ScrollToTop";
import WhatsAppFloat from "@/src/components/WhatsAppFloat";
import { useLocation } from "react-router-dom";

export default function PublicSiteLayout({ children }) {
  const { pathname } = useLocation();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="pt-16 sm:pt-20">{children}</main>
      <Footer />
      {!isAdminRoute && <WhatsAppFloat />}
    </>
  );
}
