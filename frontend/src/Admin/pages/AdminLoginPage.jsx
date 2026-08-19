"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HiOutlineKey, HiOutlineArrowRight } from "react-icons/hi";
import adminApi from "../utils/adminApi";
import { useAdminAuth } from "../context/AdminAuthContext";
import usePageTitle from "../../utils/usePageTitle";

export default function AdminLoginPage() {
  const { login, isAuthenticated, ready } = useAdminAuth();
  const [accessKey, setAccessKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  usePageTitle("Admin Login");

  useEffect(() => {
    if (ready && isAuthenticated) navigate("/admin");
  }, [ready, isAuthenticated, navigate]);

  if (ready && isAuthenticated) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accessKey.trim()) {
      toast.error("Please enter the admin access key");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await adminApi.post("/auth/login", { accessKey: accessKey.trim() });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user?.name || "Admin"}!`);
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 dark-grid">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(54,153,243,0.14) 0%, transparent 65%)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-display text-2xl font-extrabold text-white shadow-lg shadow-primary/30">
            N
          </div>
          <h1 className="mt-5 font-display text-2xl font-extrabold text-foreground">NexCode Admin</h1>
          <p className="mt-1 text-sm text-text_secondary">Sign in to manage company projects</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <label className="label" htmlFor="accessKey">
            Admin Access Key
          </label>
          <div className="relative flex items-center">
            <HiOutlineKey size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text_muted" />
            <input
              id="accessKey"
              type="password"
              autoComplete="current-password"
              className="input-field "
              placeholder="Enter your access key"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              autoFocus
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary_hover disabled:translate-y-0 disabled:opacity-60"
          >
            {submitting && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
            Sign In
            {!submitting && <HiOutlineArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text_muted">Protected area. Only authorized company admins can access.</p>
      </div>
    </div>
  );
}
