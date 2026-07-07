import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import laptopMockup from "../../assets/laptop_mockup.png";
import phoneMockup from "../../assets/phone_mockup.png";
import palm_tree from "../../assets/palm-leave.png";
import laptop_display from "../../assets/project_image.png";
import dark_L_display from "../../assets/dark_desktop.png";
import light_L_display from "../../assets/light_desktop.png";
import dark_m_display from "../../assets/dark_mobile.png";
import light_m_display from "../../assets/light_mobile.png";
import Button from "../components/Button";
/* ─────────────────────────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────────────────────────── */
function tv(theme) {
  if (theme === "light")
    return {
      orbA: "rgba(41,82,227,0.13)",
      orbB: "rgba(109,40,217,0.09)",
      orbC: "rgba(20,184,166,0.08)",
      wm: "rgba(0,0,0,0.042)",
      dots: "rgba(0,0,0,0.11)",
      grid: "rgba(0,0,0,0.055)",
      line: "rgba(0,0,0,0.05)",
      screenBg: "#f0f4ff",
      screenBorder: "rgba(41,82,227,0.18)",
      phoneScreenBg: "#e8f0ff",
    };
  if (theme === "primary")
    return {
      orbA: "rgba(79,123,255,0.30)",
      orbB: "rgba(99,102,241,0.20)",
      orbC: "rgba(20,184,166,0.14)",
      wm: "rgba(0, 0, 0, 0.04)",
      dots: "rgba(79,123,255,0.16)",
      grid: "rgba(79,123,255,0.07)",
      line: "rgba(79,123,255,0.08)",
      screenBg: "#060d2a",
      screenBorder: "rgba(79,123,255,0.30)",
      phoneScreenBg: "#08123a",
    };
  return {
    // dark
    orbA: "rgba(79,123,255,0.20)",
    orbB: "rgba(124,58,237,0.16)",
    orbC: "rgba(20,184,166,0.11)",
    wm: "rgba(255,255,255,0.036)",
    dots: "rgba(255,255,255,0.10)",
    grid: "rgba(255,255,255,0.040)",
    line: "rgba(255,255,255,0.045)",
    screenBg: "#0b0f1e",
    screenBorder: "rgba(79,123,255,0.20)",
    phoneScreenBg: "#0d1224",
  };
}

/* ─────────────────────────────────────────────────────────────
   FLOATING GLASS CARD
───────────────────────────────────────────────────────────── */
function FloatCard({ style = {}, className = "", children, delay = 0 }) {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute rounded-2xl border border-border/80
                  bg-card backdrop-blur-xl shadow-2xl pointer-events-none ${className} `}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   INLINE ICONS
───────────────────────────────────────────────────────────── */
const IcoRocket = (p = {}) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2 2.5-2.5 1-4-2.5-.5-4 1z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);
const IcoCheck = (p = {}) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const IcoUsers = (p = {}) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IcoStack = (p = {}) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);
const IcoDb = (p = {}) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);
const IcoMonitor = (p = {}) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);
const IcoArrow = (p = {}) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   LAPTOP SCREEN CONTENT  (rendered inside the bezel)
───────────────────────────────────────────────────────────── */
function LaptopScreenContent({ theme }) {
  const t = tv(theme);
  const isDark = theme !== "light";
  const isPrimary = theme === "primary";
  const textPrimary = isDark ? "#f0f4ff" : "#0a0f2e";
  const textSecondary = isDark ? "rgba(200,210,255,0.60)" : "rgba(10,15,50,0.55)";
  const accent = "#4f7bff";

  return (
    <>
      <div
        className="w-full h-full hidden md:flex flex-col items-center justify-center px-6 py-5 select-none overflow-hidden"
        style={{ background: t.screenBg, color: textPrimary }}
      >
        {/* top bar chrome */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center px-3 py-1.5 gap-1.5"
          style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", borderBottom: `1px solid ${t.screenBorder}` }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: "#ff5f57" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "#ffbd2e" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "#28c840" }} />
          <span
            className="flex-1 mx-3 rounded text-center text-[8px] py-0.5 px-2"
            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", color: textSecondary }}
          >
            nexcode.io
          </span>
          <IcoMonitor width="9" height="9" style={{ color: textSecondary }} />
        </div>

        {/* ── main content ── */}
        <div className="flex flex-row items-start justify-start w-full  text-left gap-3 mt-4">
          {/* Left Panel */}
          <div className="flex flex-col items-start justify-start w-full  text-left gap-3">
            {/* badge */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0 rounded-full text-[8px] font-semibold"
              style={{ background: "rgba(79,123,255,0.14)", border: "1px solid rgba(79,123,255,0.30)", color: accent }}
            >
              <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: accent }} />
              Available for new projects
            </div>

            {/* headline */}
            <h1
              className="font-extrabold leading-[1.08] tracking-tight hidden md:block"
              style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(14px,2.8vw,28px)", color: textPrimary }}
            >
              <span className="pb-2">Scale Your</span>
              <br />
              <em className="not-italic mr-2" style={{ color: accent }}>
                Online
              </em>
              Potential
            </h1>

            {/* sub */}
            <p style={{ fontSize: "clamp(7px,1.1vw,11px)", lineHeight: 1.6, color: textSecondary, maxWidth: 320 }}>
              From stunning front-end websites to heavy-duty enterprise architectures, we engineer platforms that scale effortlessly and captivate
              users.{" "}
            </p>

            {/* CTA row */}
            <div className="flex gap-2 flex-wrap justify-center">
              <Button variant="primary" leftIcon={<IcoRocket width="10" height="10" />} size="xs">
                Build Your Project
              </Button>

              <Button variant="secondary" rightIcon={<IcoArrow width="10" height="10" />} size="xs">
                View our Work
              </Button>
            </div>

            {/* mini stat row */}
            <div className="flex gap-4 mt-5">
              {[
                ["100%", "Satisfaction"],
                ["20+", "Projects"],
                ["10+", "Services"],
              ].map(([v, l]) => (
                <div key={l} className="flex flex-col items-center">
                  <span
                    className="font-extrabold"
                    style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(10px,1.6vw,15px)", color: textPrimary }}
                  >
                    {v}
                  </span>
                  <span style={{ fontSize: "clamp(5px,0.75vw,8px)", color: textSecondary, marginTop: 1 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Right Panel with image */}
          <div className="w-full relative h-full flex items-center justify-center ">
            <img src={palm_tree} alt="Palm Tree" className="absolute w-[60%] object-cover -right-10 -bottom-4 z-50" />
            <div className="w-full scale-125 flex relative  mr-20 mt-16 overflow-hidden">
              <div className="absolute z-0 inset-0 overflow-hidden  text-center flex items-center justify-center p-3.5 pt-6">
                <img src={laptop_display} alt="Palm Tree" className="object-cover w-[90%] " />
              </div>

              <img src={laptopMockup} alt="Palm Tree" className="object-cover z-10" />
            </div>

            {/* Revenue sparkline — mid right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.82, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute rounded-2xl border 
                  ${isPrimary ? "bg-white/5 border-border/10" : "bg-card border-border/80"} backdrop-blur-xl shadow-2xl pointer-events-none hidden md:block`}
              style={{
                top: "5%",
                right: "0%",
                width: 120,
                padding: "12px 14px",
                transform: "translateZ(42px) rotateX(4deg) rotateY(-8deg)",
                animation: "hfloat 5s ease-in-out 1.5s infinite",
              }}
            >
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 7, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Performance
                </span>
                <span style={{ fontSize: 7, color: "#22c55e", fontWeight: 700 }}>100%</span>
              </div>
              <svg viewBox="0 0 100 16" style={{ width: "100%", overflow: "visible", margin: "6px 0" }}>
                <defs>
                  <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,30 L16,23 L36,27 L54,12 L72,19 L90,7 L100,10 L100,36 L0,36 Z" fill="url(#sparkFill)" />
                <polyline
                  points="0,30 16,23 36,27 54,12 72,19 90,7 100,10"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="10" r="3.5" fill="hsl(var(--primary))" />
              </svg>
            </motion.div>

            {/* Deploy notif — bottom left */}
            <motion.div
              initial={{ opacity: 0, scale: 0.82, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.65, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute rounded-lg border 
                  ${isPrimary ? "bg-white/5 border-border/10" : "bg-card border-border/80"} backdrop-blur-xl shadow-2xl pointer-events-none hidden md:flex`}
              style={{
                top: "20%",
                right: "85%",
                padding: "5px 5px",
                alignItems: "flex-start",
                gap: 5,
                transform: "translateZ(38px) rotateX(6deg) rotateY(8deg)",
                animation: "hfloat 5s ease-in-out 2.1s infinite",
              }}
            >
              <div
                className="rounded-lg flex items-center justify-center flex-shrink-0 "
                style={{ width: 20, height: 20, background: "rgba(79,123,255,0.12)", border: "1px solid rgba(79,123,255,0.22)" }}
              >
                <IcoCheck width={12} height={12} style={{ color: "hsl(var(--primary))" }} />
              </div>
              <div>
                <div style={{ fontSize: 7, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.3 }}>Deploy successful</div>
              </div>
            </motion.div>

            {/* Deploy notif — bottom left */}
            <motion.div
              initial={{ opacity: 0, scale: 0.82, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.65, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute rounded-lg border 
                  ${isPrimary ? "bg-white/5 border-border/10" : "bg-card border-border/80"} backdrop-blur-xl shadow-2xl pointer-events-none hidden md:flex`}
              style={{
                bottom: "-10%",
                right: "95%",
                padding: "5px 10px",
                alignItems: "flex-start",
                gap: 5,
                transform: "translateZ(38px) rotateX(6deg) rotateY(8deg)",
                animation: "hfloat 5s ease-in-out 2.1s infinite",
              }}
            >
              <div
                className="rounded-lg flex items-center justify-center flex-shrink-0 "
                style={{ width: 20, height: 20, background: "rgba(79,123,255,0.12)", border: "1px solid rgba(79,123,255,0.22)" }}
              >
                <IcoCheck width={12} height={12} style={{ color: "hsl(var(--primary))" }} />
              </div>
              <div>
                <div style={{ fontSize: 7, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.3 }}>Validation successful.</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* decorative background watermark inside screen */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none overflow-hidden -z-10"
          style={{ opacity: 0.06 }}
        >
          <span
            className="font-extrabold uppercase tracking-widest whitespace-nowrap"
            style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(24px,5vw,52px)", color: textPrimary }}
          >
            NEXCODE
          </span>
        </div>

        {/* subtle dot grid inside screen */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"} 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
          }}
        />
      </div>
      <div className="w-full h-full flex flex-col items-center justify-center  select-none overflow-hidden md:hidden">
        <img src={theme === "dark" ? dark_L_display : light_L_display} alt="Mobile Display" className="object-cover w-[100%] h-[100%]" />
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   PHONE SCREEN CONTENT
───────────────────────────────────────────────────────────── */
function PhoneScreenContent({ theme }) {
  const t = tv(theme);
  const isDark = theme !== "light";
  const textPrimary = isDark ? "#f0f4ff" : "#0a0f2e";
  const textSecondary = isDark ? "rgba(200,210,255,0.55)" : "rgba(10,15,50,0.50)";
  const accent = "#4f7bff";

  return (
    <>
      <div className="w-full h-full hidden md:flex flex-col overflow-hidden select-none" style={{ background: t.phoneScreenBg, color: textPrimary }}>
        {/* status bar */}
        <div className="flex justify-between px-2 pt-0  flex-shrink-0 " style={{ fontSize: 5, color: textSecondary }}>
          <span>9:41</span>
          <div className="flex gap-1 items-center">
            <span>●●●</span>
            <span>WiFi</span>
            <span>100%</span>
          </div>
        </div>

        {/* nav */}
        <div className="flex items-center justify-between px-2  flex-shrink-0" style={{ borderBottom: `1px solid ${t.screenBorder}` }}>
          <span className="font-extrabold" style={{ fontFamily: "'Syne',sans-serif", fontSize: 8, color: accent }}>
            NexCode
          </span>
          <div className="w-2 h-4 flex flex-col gap-0.5 justify-center">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-full" style={{ height: 1, background: textSecondary, width: i === 1 ? "60%" : "100%" }} />
            ))}
          </div>
        </div>

        {/* hero block */}
        <div className="flex flex-col items-center text-center px-2.5 pt-2.5 pb-2 gap-2 flex-shrink-0">
          <h1 className="font-extrabold leading-tight" style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, color: textPrimary }}>
            Empower Your{" "}
            <em className="not-italic" style={{ color: accent }}>
              Digital
            </em>{" "}
            Growth
          </h1>
          <p style={{ fontSize: 5.5, lineHeight: 1.5, color: textSecondary }}>
            Software that moves fast and scales further.We engineer platforms that scale effortlessly and captivate users
          </p>

          <Button
            variant="primary"
            size="xxs"
            className="rounded-md  font-semibold flex items-center justify-center gap-1 px-2 scale-75"
            leftIcon={<IcoRocket width={6} height={6} />}
          >
            Build Project
          </Button>
        </div>

        {/* stats strip */}
        <div className="flex justify-around px-2 flex-shrink-0">
          {[
            ["100%", "Satisfaction"],
            ["20+", "Projects"],
            ["10+", "Services"],
          ].map(([v, l]) => (
            <div key={l} className="flex flex-col items-center">
              <span className="font-extrabold" style={{ fontFamily: "'Syne',sans-serif", fontSize: 7, color: textPrimary }}>
                {v}
              </span>
              <span style={{ fontSize: 4.5, color: textSecondary }}>{l}</span>
            </div>
          ))}
        </div>

        {/* mini cards preview */}
        <div className="flex flex-col gap-1 px-2 ">
          <div
            className="rounded-lg p-1.5 flex items-center gap-1.5"
            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: `0.5px solid ${t.screenBorder}` }}
          >
            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background: "rgba(79,123,255,0.15)" }}>
              <IcoCheck width={6} height={6} style={{ color: accent }} />
            </div>
            <div>
              <div style={{ fontSize: 5.5, fontWeight: 600, color: textPrimary }}>Deploy Successful</div>
              <div style={{ fontSize: 4.5, color: textSecondary }}>v2.4.1 is live · just now</div>
            </div>
          </div>
          <div
            className="rounded-lg p-1.5 flex items-center justify-between"
            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: `0.5px solid ${t.screenBorder}` }}
          >
            <div>
              <div style={{ fontSize: 5.5, fontWeight: 600, color: textPrimary }}>Performance</div>
              <div style={{ fontSize: 4.5, color: accent }}>93/100 · ↑ +12</div>
            </div>
            <div className="h-1 w-10 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="h-full rounded-full" style={{ width: "87%", background: accent }} />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-full  flex flex-col items-center justify-center  select-none overflow-hidden md:hidden">
        <img src={theme === "dark" ? dark_m_display : light_m_display} alt="Mobile Display" className="object-cover w-[90%] h-[95%]" />
      </div>
    </>
  );
}

/* ═════════════════════════════════════════════════════════════
   HERO  (main export)
═════════════════════════════════════════════════════════════*/
export default function Hero({ stats = [] }) {
  const { theme } = useTheme();
  const tokens = tv(theme);
  const prefersRed = useReducedMotion();

  /* refs */
  const sceneRef = useRef(null);
  const tiltRef = useRef(null); // outer tilt wrapper
  const orbARef = useRef(null);
  const orbBRef = useRef(null);
  const orbCRef = useRef(null);
  const rafRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });

  /* lid animation state */
  const lidCtrl = useAnimation();
  const [lidDone, setLidDone] = useState(false);

  /* ── Entry: laptop unfold sequence ───────────────────────── */
  useEffect(() => {
    if (prefersRed) {
      setLidDone(true);
      return;
    }

    /* 1. Start closed (lid flat, scene scaled down) */
    lidCtrl.set({ rotateX: 75, opacity: 0.3, scale: 0.88, y: 40 });

    /* 2. Short pause, then unfold */
    const t = setTimeout(async () => {
      await lidCtrl.start({
        rotateX: 0,
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
      });
      setLidDone(true);
    }, 280);

    return () => clearTimeout(t);
  }, [lidCtrl, prefersRed]);

  /* ── Parallax RAF ─────────────────────────────────────────── */
  useEffect(() => {
    if (!lidDone) return; // don't start parallax until lid is open
    const el = sceneRef.current;
    if (!el) return;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      mouse.current.x = (e.clientX - r.left) / r.width - 0.5;
      mouse.current.y = (e.clientY - r.top) / r.height - 0.5;
    };
    const onLeave = () => {
      mouse.current = { x: 0, y: 0 };
    };
    const onTouch = (e) => {
      const t = e.touches[0],
        r = el.getBoundingClientRect();
      mouse.current.x = (t.clientX - r.left) / r.width - 0.5;
      mouse.current.y = (t.clientY - r.top) / r.height - 0.5;
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchmove", onTouch, { passive: true });
    el.addEventListener("touchend", onLeave);

    const tick = () => {
      cur.current.x += (mouse.current.x - cur.current.x) * 0.055;
      cur.current.y += (mouse.current.y - cur.current.y) * 0.055;
      const { x: cx, y: cy } = cur.current;

      if (tiltRef.current) tiltRef.current.style.transform = `rotateX(${cy * -12}deg) rotateY(${cx * 12}deg)`;

      if (orbARef.current) orbARef.current.style.transform = `translate(${cx * 24}px,${cy * 24}px)`;
      if (orbBRef.current) orbBRef.current.style.transform = `translate(${cx * 38}px,${cy * 38}px)`;
      if (orbCRef.current) orbCRef.current.style.transform = `translate(${cx * 15}px,${cy * 15}px)`;

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchmove", onTouch);
      el.removeEventListener("touchend", onLeave);
    };
  }, [lidDone]);

  const displayStats =
    stats.length >= 3
      ? stats.slice(0, 3)
      : [
          { value: "98%", label: "Client satisfaction" },
          { value: "150+", label: "Projects shipped" },
          { value: "6yr", label: "In the industry" },
        ];

  return (
    <section
      ref={sceneRef}
      className="relative min-h-screen w-full overflow-hidden bg-background
                 flex flex-col items-center md:justify-center -pt-10 md:pt-0 -mt-16 md:-mt-20"
    >
      {/* ══ BACKGROUND ══════════════════════════════════════════ */}

      {/* dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${tokens.dots} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 92% 88% at 50% 50%, black 20%, transparent 100%)",
        }}
      />

      {/* guide grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${tokens.grid} 1px, transparent 1px),
           linear-gradient(90deg, ${tokens.grid} 1px, transparent 1px)`,
          backgroundSize: "100px 100px",
          maskImage: "radial-gradient(ellipse 72% 72% at 50% 50%, black, transparent)",
        }}
      />

      {/* diagonal accent lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { l: "-5%", w: "52%", op: 1 },
          { r: "16%", w: "27%", op: 0.45 },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: "-10%",
              left: s.l,
              right: s.r,
              width: s.w,
              height: "120%",
              borderRight: `1px solid ${tokens.line}`,
              transform: "rotate(-18deg) skewX(-18deg)",
              opacity: s.op,
            }}
          />
        ))}
      </div>

      {/* ambient orbs */}
      <div
        ref={orbARef}
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 680,
          height: 680,
          top: -180,
          left: -130,
          background: `radial-gradient(circle, ${tokens.orbA} 0%, transparent 68%)`,
          filter: "blur(90px)",
          willChange: "transform",
        }}
      />
      <div
        ref={orbBRef}
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 500,
          height: 500,
          bottom: -110,
          right: -110,
          background: `radial-gradient(circle, ${tokens.orbB} 0%, transparent 68%)`,
          filter: "blur(80px)",
          willChange: "transform",
        }}
      />
      <div
        ref={orbCRef}
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 320,
          height: 320,
          top: "36%",
          left: "46%",
          background: `radial-gradient(circle, ${tokens.orbC} 0%, transparent 68%)`,
          filter: "blur(60px)",
          willChange: "transform",
        }}
      />

      {/* ══ LARGE WATERMARK TEXT ════════════════════════════════ */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center
                      pointer-events-none select-none px-2"
        style={{ zIndex: 1 }}
      >
        <span
          className="font-extrabold uppercase leading-[0.90] tracking-[0.01em] sm:tracking-[0.05em] w-full text-center"
          style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(4.2rem,14vw,14rem)", color: tokens.wm }}
        >
          Digital
        </span>
        <span
          className="font-extrabold uppercase leading-[0.90] tracking-[0em] sm:tracking-[0.02em] w-full text-center"
          style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(4.2rem,14vw,14rem)", color: tokens.wm }}
        >
          Solutions
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative text-center  px-5 pt-24 md:pt-28 pb-10
                   flex flex-col items-center gap-4"
        style={{ zIndex: 10 }}
      >
        {/* headline */}
        <h1
          className="text-[clamp(2rem,5.2vw,3rem)] font-bold
                     leading-[1.05] tracking-tight text-foreground mt-0"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Empower Your <em className="not-italic text-primary">Digital</em> Growth
        </h1>

        <p className="section-subtitle">
          From sleek websites to powerful enterprise systems — NexCode ships software that moves fast, scales further, and delights every user.
        </p>
      </motion.div>

      {/* ══ DEVICE SCENE ════════════════════════════════════════ */}
      {/*
          Perspective wrapper → motion div (lid unfold) →
          tilt wrapper (mouse parallax) → laptop + floating cards
      */}
      <div className="relative z-10 w-full h-auto flex justify-center items-start " style={{ perspective: "1100px" }}>
        {/* lid unfold motion */}
        <motion.div
          animate={lidCtrl}
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "50% 80%" /* rotate around the base hinge */,
            willChange: "transform,opacity",
          }}
          className="relative flex justify-center items-center "
        >
          {/* parallax tilt wrapper */}
          <div
            ref={tiltRef}
            style={{
              transformStyle: "preserve-3d",
              willChange: "transform",
              transition: "transform 0.09s linear",
              position: "relative",
            }}
          >
            {/* ── laptop frame ─────────────────────────────────── */}
            <div className="relative" style={{ width: "min(800px, 88vw)" }}>
              {/* the PNG frame */}
              <img
                src={laptopMockup}
                alt="Laptop"
                className="w-full h-auto relative select-none drop-shadow-2xl"
                style={{ zIndex: 20, pointerEvents: "none" }}
                draggable={false}
              />

              {/* ── SCREEN CONTENT inside bezel ──────────────────
                  Adjust these % to match your laptop_mockup.png exactly.
                  width/height/top/left are relative to the img size.       */}
              <div
                className="absolute overflow-hidden"
                style={{
                  width: "77.4%",
                  height: "83%",
                  top: "4.8%",
                  left: "11.3%",
                  zIndex: 10,
                  border: `1px solid ${tokens.screenBorder}`,
                  borderRadius: "2px",
                }}
              >
                <LaptopScreenContent theme={theme} />

                {/* shimmer sweep over screen */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 30 }}>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "-70%",
                      width: "45%",
                      height: "100%",
                      background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)",
                      animation: "shimmer 4s ease-in-out 1.6s infinite",
                    }}
                  />
                </div>
              </div>

              {/* ── phone mockup — bottom-left ──────────────────── */}
              <div className="absolute z-30" style={{ bottom: "-1%", left: "1%", width: "12%" }}>
                <div className="relative">
                  <img src={phoneMockup} alt="Phone" className="w-full h-auto relative z-20 drop-shadow-xl" draggable={false} />
                  <div className="absolute inset-0 z-10 overflow-hidden" style={{ borderRadius: "18%" }}>
                    <PhoneScreenContent theme={theme} />
                  </div>
                </div>
              </div>
            </div>
            {/* laptop frame */}

            {/* ══ FLOATING 3D CARDS ═══════════════════════════════ */}

            {/* Performance — top right */}
            <FloatCard
              delay={1.2}
              style={{
                top: "5%",
                right: "-20%",
                width: 152,
                padding: "14px 16px",
                transform: "translateZ(55px) rotateX(-6deg) rotateY(-8deg)",
                animation: "hfloat 5s ease-in-out 0s infinite",
              }}
              className="md:block hidden"
            >
              <div style={{ fontSize: 9, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Performance</div>
              <div className="flex items-end gap-1 mt-1">
                <span className="font-extrabold leading-none" style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, color: "var(--foreground)" }}>
                  93
                </span>
                <span style={{ fontSize: 12, color: "var(--muted-foreground)", paddingBottom: 2 }}>/100</span>
              </div>
              <div className="rounded-full overflow-hidden mt-2" style={{ height: 4, background: "rgba(128,128,128,0.2)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: "87%", background: "hsl(var(--primary))", animation: "grow 2s ease-out 1.4s both" }}
                />
              </div>
              <div style={{ fontSize: 9, color: "#22c55e", fontWeight: 600, marginTop: 6 }}>↑ +12 this sprint</div>
            </FloatCard>

            {/* Active users — top left */}
            <FloatCard
              delay={1.35}
              className="hidden md:flex"
              style={{
                top: "6%",
                left: "-13%",
                padding: "12px 14px",
                alignItems: "center",
                gap: 10,
                transform: "translateZ(48px) rotateX(-5deg) rotateY(8deg)",
                animation: "hfloat 5s ease-in-out 0.9s infinite",
              }}
            >
              <div
                className="rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ width: 36, height: 36, background: "rgba(79,123,255,0.15)", border: "1px solid rgba(79,123,255,0.25)" }}
              >
                <IcoUsers width={18} height={18} style={{ color: "hsl(var(--primary))" }} />
              </div>
              <div>
                <div className="font-extrabold leading-none" style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, color: "var(--foreground)" }}>
                  15+
                </div>
                <div style={{ fontSize: 9, color: "var(--muted-foreground)", marginTop: 2 }}>Workspace</div>
              </div>
            </FloatCard>

            {/* Revenue sparkline — mid right */}
            <FloatCard
              delay={1.5}
              style={{
                top: "52%",
                right: "-14%",
                width: 158,
                padding: "12px 14px",
                transform: "translateZ(42px) rotateX(4deg) rotateY(-8deg)",
                animation: "hfloat 5s ease-in-out 1.5s infinite",
              }}
              className="md:block hidden"
            >
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 9, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Delivery Trend
                </span>
                <span style={{ fontSize: 9, color: "#22c55e", fontWeight: 700 }}>+72%</span>
              </div>
              <svg viewBox="0 0 100 36" style={{ width: "100%", overflow: "visible", margin: "6px 0" }}>
                <defs>
                  <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,30 L16,23 L36,27 L54,12 L72,19 L90,7 L100,10 L100,36 L0,36 Z" fill="url(#sparkFill)" />
                <polyline
                  points="0,30 16,23 36,27 54,12 72,19 90,7 100,10"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="10" r="3.5" fill="hsl(var(--primary))" />
              </svg>
              <div style={{ fontSize: 9, color: "var(--muted-foreground)" }}>Recent work cycle</div>
            </FloatCard>

            {/* Deploy notif — bottom left */}
            <FloatCard
              delay={1.65}
              style={{
                bottom: "16%",
                left: "-25%",
                padding: "10px 12px",
                alignItems: "flex-start",
                gap: 10,
                transform: "translateZ(38px) rotateX(6deg) rotateY(8deg)",
                animation: "hfloat 5s ease-in-out 2.1s infinite",
              }}
              className="hidden md:flex"
            >
              <div
                className="rounded-lg flex items-center justify-center flex-shrink-0 "
                style={{ width: 28, height: 28, background: "rgba(79,123,255,0.12)", border: "1px solid rgba(79,123,255,0.22)" }}
              >
                <IcoCheck width={12} height={12} style={{ color: "hsl(var(--primary))" }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.3 }}>Deploy successful</div>
                <div style={{ fontSize: 9, color: "var(--muted-foreground)", marginTop: 2 }}>v2.4.1 is live · just now</div>
              </div>
            </FloatCard>

            {/* Happy clients — bottom right */}
            <FloatCard
              delay={1.8}
              style={{
                padding: "10px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                transform: "translateZ(40px) rotateX(5deg) rotateY(-6deg)",
                animation: "hfloat 5s ease-in-out 1.1s infinite",
              }}
              className="md:block hidden right-[5%] bottom-[-50%] md:right-[-25%] md:bottom-[1%]"
            >
              <div style={{ display: "flex" }}>
                {["#4f7bff", "#7c3aed", "#14b8a6", "#f97316"].map((c, i) => (
                  <div
                    key={i}
                    className="rounded-full mx-auto md:mx-0 md:border-1 border-none flex-shrink-0 w-[20px] h-[20px]  md:w-[24px] md:h-[24px]"
                    style={{ background: c, borderColor: "var(--card)", marginLeft: i ? -8 : 0, zIndex: 4 - i }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 9, color: "var(--muted-foreground)" }}>Built for new collaborations</div>
            </FloatCard>

            {/* ── tech pills — orbit outside tilt wrap ── */}
            {[
              { Icon: IcoStack, label: "React + TypeScript", s: { top: "-10%", left: "-25%" }, delay: 1.9 },
              { Icon: IcoDb, label: "Node.js API", s: { top: "40%", right: "-30%" }, delay: 2.1 },
              { Icon: IcoMonitor, label: "Cloud Deployed", s: { bottom: "-15%", left: "10%" }, delay: 2.3 },
            ].map(({ Icon, label, s, delay: d }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: d, ease: [0.22, 1, 0.36, 1] }}
                className="absolute md:flex items-center gap-1.5 px-3 py-1.5 hidden  rounded-full
                           border border-border/40 bg-card/55 backdrop-blur-md
                           text-muted-foreground whitespace-nowrap pointer-events-none z-50"
                style={{ fontSize: 10, animation: `hfloat 4s ease-in-out ${d - 1.9}s infinite`, ...s }}
              >
                <Icon width={10} height={10} style={{ color: "hsl(var(--primary))", flexShrink: 0 }} />
                {label}
              </motion.div>
            ))}

            {/* Mobile View Tech Pills */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute flex items-center gap-1.5 px-3 py-0.5 md:hidden  rounded-full
                           border border-border/40 bg-card/55 backdrop-blur-md
                           text-muted-foreground whitespace-nowrap pointer-events-none z-50 -bottom-16"
              style={{ fontSize: 10, animation: `hfloat 4s ease-in-out  infinite` }}
            >
              <IcoStack width={10} height={10} style={{ color: "hsl(var(--primary))", flexShrink: 0 }} />
              React + TypeScript
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 2.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute flex items-center gap-1.5 px-3 py-0.5 md:hidden  rounded-full
                           border border-border/40 bg-card/60 backdrop-blur-2xl
                           text-muted-foreground whitespace-nowrap pointer-events-none z-50 -top-6 -left-4"
              style={{ fontSize: 10, animation: `hfloat 4s ease-in-out  infinite` }}
            >
              <IcoDb width={10} height={10} style={{ color: "hsl(var(--primary))", flexShrink: 0 }} />
              Node.js API
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 2.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute flex items-center gap-1.5 px-3 py-0.5 md:hidden  rounded-full
                           border border-border/40 bg-card/55 backdrop-blur-md
                           text-muted-foreground whitespace-nowrap pointer-events-none z-50 -top-10 right-0"
              style={{ fontSize: 10, animation: `hfloat 4s ease-in-out  infinite` }}
            >
              <IcoMonitor width={10} height={10} style={{ color: "hsl(var(--primary))", flexShrink: 0 }} />
              Cloud Deployed
            </motion.div>

            {/* Revenue sparkline — mid right */}
            <FloatCard
              delay={1.5}
              style={{
                width: 120,
                padding: "8px 12px",
                transform: "translateZ(42px) rotateX(4deg) rotateY(-8deg)",
                animation: "hfloat 5s ease-in-out 1.5s infinite",
              }}
              className="md:hidden block -bottom-[135px] left-10"
            >
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 9, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Revenue</span>
                <span style={{ fontSize: 9, color: "#22c55e", fontWeight: 700 }}>+32%</span>
              </div>
            </FloatCard>
          </div>
          {/* tilt */}
        </motion.div>
        {/* lid unfold */}
      </div>
      {/* perspective */}

      {/* ── scroll hint ───────────────────────────────────────── */}
      <div
        className="mt-10 mb-5 mx-auto z-20 hidden md:flex
                      flex-col items-center gap-1.5 pointer-events-none"
      >
        <div className="rounded-[9px] border border-border_hard/50 flex justify-center items-start" style={{ width: 18, height: 28, paddingTop: 5 }}>
          <div className="rounded-full bg-primary" style={{ width: 2, height: 5, animation: "scrollW 1.8s ease-in-out infinite" }} />
        </div>
        <span className="text-muted-foreground uppercase tracking-[.15em]" style={{ fontSize: 10 }}>
          scroll
        </span>
      </div>

      {/* ══ KEYFRAMES ═══════════════════════════════════════════ */}
      <style>{`

        @keyframes hfloat {
          0%,100% { transform: translateY(0px);  }
          50%     { transform: translateY(-9px); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-70%); }
          100% { transform: translateX(230%); }
        }
        @keyframes grow {
          from { width: 0;   }
          to   { width: 87%; }
        }
        @keyframes scrollW {
          0%,100% { transform: translateY(0);   opacity: 1; }
          55%     { transform: translateY(7px); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
