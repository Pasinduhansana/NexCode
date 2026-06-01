// import { useEffect, useRef } from "react";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import { useTheme } from "../context/ThemeContext";
// import laptopMockup from "../../assets/laptop_mockup.png";
// import projectImage from "../../assets/project_image.png";
// import projectImageMob from "../../assets/project_image1_mob.png";
// import phoneMockup from "../../assets/phone_mockup.png";

// /* ─── reusable floating glass card ───────────────────────── */
// function FloatCard({ className = "", style = {}, children }) {
//   return (
//     <div
//       className={`absolute rounded-2xl border border-border/40
//                   bg-card/65 backdrop-blur-xl shadow-xl
//                   pointer-events-none ${className}`}
//       style={style}
//     >
//       {children}
//     </div>
//   );
// }

// /* ─── theme colour tokens ─────────────────────────────────── */
// function themeVars(theme) {
//   if (theme === "light")
//     return {
//       orbA: "rgba(41,82,227,0.12)",
//       orbB: "rgba(109,40,217,0.09)",
//       orbC: "rgba(20,184,166,0.08)",
//       wm: "rgba(0,0,0,0.045)",
//       dots: "rgba(0,0,0,0.12)",
//       grid: "rgba(0,0,0,0.06)",
//       line: "rgba(0,0,0,0.055)",
//     };
//   if (theme === "primary")
//     return {
//       orbA: "rgba(79,123,255,0.32)",
//       orbB: "rgba(99,102,241,0.22)",
//       orbC: "rgba(20,184,166,0.15)",
//       wm: "rgba(255,255,255,0.04)",
//       dots: "rgba(79,123,255,0.18)",
//       grid: "rgba(79,123,255,0.07)",
//       line: "rgba(79,123,255,0.08)",
//     };
//   return {
//     /* dark (default) */ orbA: "rgba(79,123,255,0.22)",
//     orbB: "rgba(124,58,237,0.18)",
//     orbC: "rgba(20,184,166,0.12)",
//     wm: "rgba(255,255,255,0.038)",
//     dots: "rgba(255,255,255,0.12)",
//     grid: "rgba(255,255,255,0.045)",
//     line: "rgba(255,255,255,0.05)",
//   };
// }

// /* ─── inline SVG icons ────────────────────────────────────── */
// const IconRocket = (
//   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2 2.5-2.5 1-4-2.5-.5-4 1z" />
//     <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
//     <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
//     <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
//   </svg>
// );
// const IconStack = (
//   <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <polygon points="12 2 2 7 12 12 22 7 12 2" />
//     <polyline points="2 17 12 22 22 17" />
//     <polyline points="2 12 12 17 22 12" />
//   </svg>
// );
// const IconDb = (
//   <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <ellipse cx="12" cy="5" rx="9" ry="3" />
//     <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
//     <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
//   </svg>
// );
// const IconMonitor = (
//   <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <rect x="2" y="3" width="20" height="14" rx="2" />
//     <line x1="8" y1="21" x2="16" y2="21" />
//     <line x1="12" y1="17" x2="12" y2="21" />
//   </svg>
// );
// const IconCheck = (
//   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//     <path d="M20 6 9 17l-5-5" />
//   </svg>
// );
// const IconUsers = (
//   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
//     <circle cx="9" cy="7" r="4" />
//     <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
//     <path d="M16 3.13a4 4 0 0 1 0 7.75" />
//   </svg>
// );

// /* ════════════════════════════════════════════════════════════
//    HERO COMPONENT
// ════════════════════════════════════════════════════════════ */
// export default function Hero({ stats = [] }) {
//   const { theme } = useTheme();
//   const tv = themeVars(theme);

//   const sceneRef = useRef(null);
//   const laptopRef = useRef(null);
//   const orbARef = useRef(null);
//   const orbBRef = useRef(null);
//   const orbCRef = useRef(null);
//   const rafRef = useRef(null);
//   const mouse = useRef({ x: 0, y: 0 });
//   const cur = useRef({ x: 0, y: 0 });

//   /* ── parallax RAF loop ─────────────────────────────────── */
//   useEffect(() => {
//     const el = sceneRef.current;
//     if (!el) return;

//     const onMove = (e) => {
//       const r = el.getBoundingClientRect();
//       mouse.current.x = (e.clientX - r.left) / r.width - 0.5;
//       mouse.current.y = (e.clientY - r.top) / r.height - 0.5;
//     };
//     const onLeave = () => {
//       mouse.current = { x: 0, y: 0 };
//     };
//     const onTouch = (e) => {
//       const t = e.touches[0],
//         r = el.getBoundingClientRect();
//       mouse.current.x = (t.clientX - r.left) / r.width - 0.5;
//       mouse.current.y = (t.clientY - r.top) / r.height - 0.5;
//     };

//     el.addEventListener("mousemove", onMove);
//     el.addEventListener("mouseleave", onLeave);
//     el.addEventListener("touchmove", onTouch, { passive: true });
//     el.addEventListener("touchend", onLeave);

//     const tick = () => {
//       cur.current.x += (mouse.current.x - cur.current.x) * 0.06;
//       cur.current.y += (mouse.current.y - cur.current.y) * 0.06;
//       const { x: cx, y: cy } = cur.current;

//       if (laptopRef.current) laptopRef.current.style.transform = `rotateX(${cy * -14}deg) rotateY(${cx * 14}deg)`;

//       if (orbARef.current) orbARef.current.style.transform = `translate(${cx * 22}px,${cy * 22}px)`;
//       if (orbBRef.current) orbBRef.current.style.transform = `translate(${cx * 36}px,${cy * 36}px)`;
//       if (orbCRef.current) orbCRef.current.style.transform = `translate(${cx * 14}px,${cy * 14}px)`;

//       rafRef.current = requestAnimationFrame(tick);
//     };
//     rafRef.current = requestAnimationFrame(tick);

//     return () => {
//       cancelAnimationFrame(rafRef.current);
//       el.removeEventListener("mousemove", onMove);
//       el.removeEventListener("mouseleave", onLeave);
//       el.removeEventListener("touchmove", onTouch);
//       el.removeEventListener("touchend", onLeave);
//     };
//   }, []);

//   const displayStats =
//     stats.length >= 3
//       ? stats.slice(0, 3)
//       : [
//           { value: "98%", label: "Client satisfaction" },
//           { value: "150+", label: "Projects shipped" },
//           { value: "6yr", label: "In the industry" },
//         ];

//   return (
//     <section
//       ref={sceneRef}
//       className="relative min-h-screen w-full overflow-hidden bg-background
//                  flex flex-col items-center justify-start"
//     >
//       {/* ════ BACKGROUND LAYERS ════════════════════════════════ */}

//       {/* fine dot grid */}
//       <div
//         className="absolute inset-0 pointer-events-none"
//         style={{
//           backgroundImage: `radial-gradient(${tv.dots} 1px, transparent 1px)`,
//           backgroundSize: "28px 28px",
//           maskImage: "radial-gradient(ellipse 90% 85% at 50% 50%, black 30%, transparent 100%)",
//         }}
//       />

//       {/* large guide-line grid */}
//       <div
//         className="absolute inset-0 pointer-events-none"
//         style={{
//           backgroundImage: `linear-gradient(${tv.grid} 1px, transparent 1px),
//              linear-gradient(90deg, ${tv.grid} 1px, transparent 1px)`,
//           backgroundSize: "100px 100px",
//           maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)",
//         }}
//       />

//       {/* diagonal accent lines */}
//       <div className="absolute inset-0 pointer-events-none overflow-hidden">
//         <div
//           className="absolute"
//           style={{
//             top: "-10%",
//             left: "-5%",
//             width: "55%",
//             height: "120%",
//             borderRight: `1px solid ${tv.line}`,
//             transform: "rotate(-18deg) skewX(-18deg)",
//           }}
//         />
//         <div
//           className="absolute"
//           style={{
//             top: "-10%",
//             right: "16%",
//             width: "28%",
//             height: "120%",
//             borderRight: `1px solid ${tv.line}`,
//             transform: "rotate(-18deg) skewX(-18deg)",
//             opacity: 0.5,
//           }}
//         />
//       </div>

//       {/* ambient orbs */}
//       <div
//         ref={orbARef}
//         className="absolute pointer-events-none rounded-full"
//         style={{
//           width: 700,
//           height: 700,
//           top: -180,
//           left: -120,
//           background: `radial-gradient(circle, ${tv.orbA} 0%, transparent 68%)`,
//           filter: "blur(90px)",
//           willChange: "transform",
//         }}
//       />
//       <div
//         ref={orbBRef}
//         className="absolute pointer-events-none rounded-full"
//         style={{
//           width: 520,
//           height: 520,
//           bottom: -120,
//           right: -100,
//           background: `radial-gradient(circle, ${tv.orbB} 0%, transparent 68%)`,
//           filter: "blur(80px)",
//           willChange: "transform",
//         }}
//       />
//       <div
//         ref={orbCRef}
//         className="absolute pointer-events-none rounded-full"
//         style={{
//           width: 340,
//           height: 340,
//           top: "38%",
//           left: "44%",
//           background: `radial-gradient(circle, ${tv.orbC} 0%, transparent 68%)`,
//           filter: "blur(60px)",
//           willChange: "transform",
//         }}
//       />

//       {/* ════ WATERMARK TEXT — sits between bg and content ════ */}
//       <div
//         className="absolute inset-0 flex flex-col items-center justify-center
//                    pointer-events-none select-none overflow-hidden"
//         style={{ zIndex: 1 }}
//       >
//         <span
//           className="font-extrabold uppercase leading-[0.92] tracking-[0.14em]
//                      text-[clamp(5rem,15vw,14rem)]"
//           style={{ color: tv.wm, fontFamily: "'Syne', sans-serif" }}
//         >
//           Digital
//         </span>
//         <span
//           className="font-extrabold uppercase leading-[0.92] tracking-[0.14em]
//                      text-[clamp(5rem,15vw,14rem)]"
//           style={{ color: tv.wm, fontFamily: "'Syne', sans-serif" }}
//         >
//           Solutions
//         </span>
//       </div>

//       {/* ════ TOP COPY — headline, sub, CTA ════════════════════ */}
//       <motion.div
//         initial={{ opacity: 0, y: 28 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
//         className="relative text-center px-5 pt-28 sm:pt-32 pb-8
//                    flex flex-col items-center gap-4"
//         style={{ zIndex: 10 }}
//       >
//         {/* badge */}
//         <div
//           className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
//                         border border-primary/30 bg-primary/10 text-primary
//                         text-xs font-medium"
//         >
//           <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
//           Available for new projects
//         </div>

//         {/* headline */}
//         <h1
//           className="text-[clamp(2rem,5.2vw,3.75rem)] font-extrabold
//                      leading-[1.05] tracking-tight text-foreground max-w-3xl"
//           style={{ fontFamily: "'Syne', sans-serif" }}
//         >
//           Empower Your <em className="not-italic text-primary">Digital</em> Growth
//         </h1>

//         <p
//           className="text-sm sm:text-base text-muted-foreground
//                       leading-relaxed max-w-xl"
//         >
//           From sleek websites to powerful enterprise systems — NexCode ships software that moves fast, scales further, and delights every user.
//         </p>

//         {/* CTA buttons */}
//         <div className="flex flex-wrap gap-3 justify-center">
//           <Link
//             to="/start-project"
//             className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl
//                        bg-primary text-white text-sm font-semibold
//                        hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30
//                        transition-all duration-200"
//           >
//             {IconRocket}
//             Build Your Next Project
//           </Link>
//           <Link
//             to="/work"
//             className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl
//                        border border-border bg-card/50 backdrop-blur-sm
//                        text-sm font-medium text-foreground
//                        hover:border-primary/50 hover:bg-card/80
//                        transition-all duration-200"
//           >
//             View our Work
//           </Link>
//         </div>
//       </motion.div>

//       {/* ════ LAPTOP CENTREPIECE + FLOATING CARDS ══════════════ */}
//       <motion.div
//         initial={{ opacity: 0, y: 44, scale: 0.95 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
//         className="relative w-full flex justify-center"
//         style={{ zIndex: 10, perspective: "1200px", paddingLeft: "5vw", paddingRight: "5vw", paddingBottom: "7rem" }}
//       >
//         {/* 3-D tilt wrapper */}
//         <div
//           ref={laptopRef}
//           className="relative"
//           style={{
//             transformStyle: "preserve-3d",
//             willChange: "transform",
//             transition: "transform 0.09s linear",
//             width: "min(820px, 90vw)",
//           }}
//         >
//           {/* ── laptop image + screen content ───────────────── */}
//           <div className="relative w-full">
//             <img src={laptopMockup} alt="Laptop Mockup" className="w-full h-auto relative z-20 drop-shadow-2xl select-none" draggable={false} />

//             {/* project screenshot clipped to bezel — tweak % to match your asset */}
//             <div className="absolute overflow-hidden" style={{ width: "77.4%", height: "83%", top: "4.8%", left: "11.4%", zIndex: 10 }}>
//               <img
//                 src={projectImage}
//                 alt="Project Screenshot"
//                 className="w-full h-full object-cover object-top
//                            transition-transform duration-500 hover:scale-105"
//               />
//             </div>

//             {/* phone — bottom-left corner of laptop */}
//             <div className="absolute z-30" style={{ bottom: "-2%", left: "1%", width: "13%" }}>
//               <div className="relative">
//                 <img src={phoneMockup} alt="Phone Mockup" className="w-full h-auto relative z-20 drop-shadow-xl" draggable={false} />
//                 <div className="absolute inset-0 overflow-hidden z-10" style={{ borderRadius: "22%" }}>
//                   <img src={projectImageMob} alt="Mobile Screenshot" className="w-full h-full object-cover" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ── floating card: Performance (top-right) ───────── */}
//           <FloatCard
//             className="flex flex-col gap-2 p-3.5 z-40"
//             style={{
//               top: "6%",
//               right: "-10%",
//               width: 148,
//               transform: "translateZ(52px) rotateX(-5deg) rotateY(-6deg)",
//               animation: "hfloat 5s ease-in-out 0s infinite",
//             }}
//           >
//             <span className="text-[9px] text-muted-foreground tracking-wide uppercase">Performance</span>
//             <div className="flex items-end gap-1">
//               <span className="text-2xl font-extrabold text-foreground leading-none" style={{ fontFamily: "'Syne',sans-serif" }}>
//                 87
//               </span>
//               <span className="text-xs text-muted-foreground pb-0.5">/100</span>
//             </div>
//             <div className="h-1 w-full rounded-full bg-muted/40 overflow-hidden">
//               <div className="h-full bg-primary rounded-full" style={{ width: "87%", animation: "grow 2s ease-out forwards" }} />
//             </div>
//             <span className="text-[9px] text-emerald-500 font-semibold">↑ +12 this sprint</span>
//           </FloatCard>

//           {/* ── floating card: Active users (top-left) ──────── */}
//           <FloatCard
//             className="flex items-center gap-3 p-3.5 z-40"
//             style={{
//               top: "8%",
//               left: "-9%",
//               transform: "translateZ(46px) rotateX(-5deg) rotateY(6deg)",
//               animation: "hfloat 5s ease-in-out 0.8s infinite",
//             }}
//           >
//             <div
//               className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20
//                             flex items-center justify-center text-primary flex-shrink-0"
//             >
//               {IconUsers}
//             </div>
//             <div>
//               <div className="text-xl font-extrabold text-foreground leading-none" style={{ fontFamily: "'Syne',sans-serif" }}>
//                 24.8k
//               </div>
//               <div className="text-[9px] text-muted-foreground mt-0.5">Active users</div>
//             </div>
//           </FloatCard>

//           {/* ── floating card: Revenue sparkline (mid-right) ─── */}
//           <FloatCard
//             className="flex flex-col gap-2 p-3.5 z-40"
//             style={{
//               top: "54%",
//               right: "-11%",
//               width: 152,
//               transform: "translateZ(40px) rotateX(3deg) rotateY(-6deg)",
//               animation: "hfloat 5s ease-in-out 1.4s infinite",
//             }}
//           >
//             <div className="flex items-center justify-between">
//               <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Revenue</span>
//               <span className="text-[9px] text-emerald-500 font-semibold">+32%</span>
//             </div>
//             <svg viewBox="0 0 100 36" className="w-full" style={{ overflow: "visible" }}>
//               <polyline
//                 points="0,30 16,23 36,27 54,12 72,19 90,7 100,10"
//                 fill="none"
//                 stroke="hsl(var(--primary))"
//                 strokeWidth="2.5"
//                 strokeLinejoin="round"
//                 strokeLinecap="round"
//               />
//               <circle cx="100" cy="10" r="3" fill="hsl(var(--primary))" />
//             </svg>
//             <div className="text-[9px] text-muted-foreground">Last 7 months</div>
//           </FloatCard>

//           {/* ── floating card: Deploy notif (bottom-left) ───── */}
//           <FloatCard
//             className="flex items-start gap-2.5 p-3 z-40"
//             style={{
//               bottom: "14%",
//               left: "-9%",
//               transform: "translateZ(36px) rotateX(5deg) rotateY(7deg)",
//               animation: "hfloat 5s ease-in-out 2s infinite",
//             }}
//           >
//             <div
//               className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20
//                             flex items-center justify-center flex-shrink-0 text-primary"
//             >
//               {IconCheck}
//             </div>
//             <div>
//               <p className="text-[10px] text-foreground font-medium leading-snug">Deploy successful</p>
//               <p className="text-[9px] text-muted-foreground">v2.4.1 is live · just now</p>
//             </div>
//           </FloatCard>

//           {/* ── floating card: Happy clients (bottom-right) ─── */}
//           <FloatCard
//             className="flex flex-col gap-2 px-4 py-3 z-40"
//             style={{
//               bottom: "12%",
//               right: "-8%",
//               transform: "translateZ(38px) rotateX(4deg) rotateY(-5deg)",
//               animation: "hfloat 5s ease-in-out 1s infinite",
//             }}
//           >
//             <div className="flex">
//               {["#4f7bff", "#7c3aed", "#14b8a6", "#f97316"].map((c, i) => (
//                 <div
//                   key={i}
//                   className="w-6 h-6 rounded-full border-2 border-card flex-shrink-0"
//                   style={{ background: c, marginLeft: i ? -8 : 0, zIndex: 4 - i }}
//                 />
//               ))}
//             </div>
//             <p className="text-[9px] text-muted-foreground leading-tight">
//               <span className="font-semibold text-foreground">150+</span> happy clients
//             </p>
//           </FloatCard>
//         </div>
//         {/* end tilt wrap */}

//         {/* ── tech pills — float independently outside tilt ── */}
//         {[
//           { icon: IconStack, label: "React + TypeScript", style: { top: "20%", left: "calc(50% - min(820px,90vw)/2 - 52px)" }, delay: 0 },
//           { icon: IconDb, label: "Node.js API", style: { top: "52%", right: "calc(50% - min(820px,90vw)/2 - 18px)" }, delay: 1.2 },
//           { icon: IconMonitor, label: "Cloud Deployed", style: { bottom: "20%", left: "calc(50% - 66px)" }, delay: 2.2 },
//         ].map(({ icon, label, style, delay }) => (
//           <div
//             key={label}
//             className="absolute flex items-center gap-1.5 px-3 py-1.5 rounded-full
//                        border border-border/40 bg-card/55 backdrop-blur-md
//                        text-[10px] text-muted-foreground whitespace-nowrap pointer-events-none"
//             style={{ ...style, animation: `hfloat 4s ease-in-out ${delay}s infinite` }}
//           >
//             <span className="text-primary">{icon}</span>
//             {label}
//           </div>
//         ))}
//       </motion.div>
//       {/* end laptop section */}

//       {/* ════ STATS BAR — pinned to bottom ═════════════════════ */}
//       <motion.div
//         initial={{ opacity: 0, y: 18 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
//         className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20
//                    flex items-center rounded-2xl overflow-hidden
//                    border border-border/40 bg-card/55 backdrop-blur-xl"
//       >
//         {displayStats.map((s, i) => (
//           <div
//             key={i}
//             className="flex flex-col items-center px-6 py-3
//                           border-r border-border/30 last:border-0"
//           >
//             <span className="text-xl font-extrabold text-foreground tracking-tight" style={{ fontFamily: "'Syne',sans-serif" }}>
//               {s.value}
//             </span>
//             <span className="text-[9px] text-muted-foreground tracking-wide mt-0.5 uppercase">{s.label}</span>
//           </div>
//         ))}
//       </motion.div>

//       {/* ── scroll hint ──────────────────────────────────────── */}
//       <div
//         className="absolute bottom-[4.5rem] right-6 z-20 hidden md:flex
//                       flex-col items-center gap-1.5 pointer-events-none"
//       >
//         <div
//           className="w-[18px] h-[28px] rounded-[9px] border border-border/50
//                         flex justify-center items-start pt-[5px]"
//         >
//           <div className="w-[2px] h-[5px] rounded-full bg-primary" style={{ animation: "scrollW 1.8s ease-in-out infinite" }} />
//         </div>
//         <span className="text-[8px] tracking-[.15em] text-muted-foreground uppercase">scroll</span>
//       </div>

//       {/* ════ KEYFRAMES ═════════════════════════════════════════ */}
//       <style>{`

//         @keyframes hfloat {
//           0%,100% { transform: translateY(0px);  }
//           50%     { transform: translateY(-8px); }
//         }
//         @keyframes grow {
//           from { width: 0;   }
//           to   { width: 87%; }
//         }
//         @keyframes scrollW {
//           0%,100% { transform: translateY(0);   opacity: 1; }
//           55%     { transform: translateY(7px); opacity: 0; }
//         }
//       `}</style>
//     </section>
//   );
// }

/**
 * Hero.jsx — NexCode
 *
 * Features:
 *  • Laptop "unfold" entry animation (lid rotates from closed → open)
 *  • Headline + sub-copy + CTA rendered inside the laptop screen
 *  • Phone mockup shows a mobile-UI version of the same content
 *  • Five 3D floating glass cards orbit the device
 *  • Mouse-parallax tilts the whole scene
 *  • Geometric background: dot grid + guide grid + diagonal lines + orbs
 *  • Dark / Light / Primary (blue) theme support
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import laptopMockup from "../../assets/laptop_mockup.png";
import phoneMockup from "../../assets/phone_mockup.png";

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
      wm: "rgba(255,255,255,0.04)",
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
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute rounded-2xl border border-border/40
                  bg-card/70 backdrop-blur-xl shadow-2xl pointer-events-none ${className}`}
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
  const textPrimary = isDark ? "#f0f4ff" : "#0a0f2e";
  const textSecondary = isDark ? "rgba(200,210,255,0.60)" : "rgba(10,15,50,0.55)";
  const accent = "#4f7bff";

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center px-6 py-5 select-none overflow-hidden"
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
      <div className="flex flex-col items-center text-center gap-3 mt-4">
        {/* badge */}
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-semibold"
          style={{ background: "rgba(79,123,255,0.14)", border: "1px solid rgba(79,123,255,0.30)", color: accent }}
        >
          <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: accent }} />
          Available for new projects
        </div>

        {/* headline */}
        <h1
          className="font-extrabold leading-[1.08] tracking-tight"
          style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(14px,2.8vw,28px)", color: textPrimary }}
        >
          Empower Your{" "}
          <em className="not-italic" style={{ color: accent }}>
            Digital
          </em>{" "}
          Growth
        </h1>

        {/* sub */}
        <p style={{ fontSize: "clamp(7px,1.1vw,11px)", lineHeight: 1.6, color: textSecondary, maxWidth: 320 }}>
          From sleek websites to enterprise systems — NexCode ships software that moves fast, scales further, and delights every user.
        </p>

        {/* CTA row */}
        <div className="flex gap-2 flex-wrap justify-center">
          <button
            className="inline-flex items-center gap-1.5 rounded-lg font-semibold"
            style={{
              background: accent,
              color: "#fff",
              fontSize: "clamp(7px,1vw,10px)",
              padding: "5px 14px",
              border: "none",
              cursor: "default",
            }}
          >
            <IcoRocket width="9" height="9" />
            Build Your Project
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg font-medium"
            style={{
              background: "transparent",
              color: textPrimary,
              fontSize: "clamp(7px,1vw,10px)",
              padding: "5px 12px",
              border: `1px solid ${t.screenBorder}`,
              cursor: "default",
            }}
          >
            View our Work
            <IcoArrow width="8" height="8" />
          </button>
        </div>

        {/* mini stat row */}
        <div className="flex gap-4 mt-1">
          {[
            ["98%", "Satisfaction"],
            ["150+", "Projects"],
            ["6yr", "Experience"],
          ].map(([v, l]) => (
            <div key={l} className="flex flex-col items-center">
              <span className="font-extrabold" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(10px,1.6vw,15px)", color: textPrimary }}>
                {v}
              </span>
              <span style={{ fontSize: "clamp(5px,0.75vw,8px)", color: textSecondary, marginTop: 1 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* decorative background watermark inside screen */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none overflow-hidden -z-10" style={{ opacity: 0.06 }}>
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
    <div className="w-full h-full flex flex-col overflow-hidden select-none" style={{ background: t.phoneScreenBg, color: textPrimary }}>
      {/* status bar */}
      <div className="flex justify-between px-2 pt-1.5 pb-1 flex-shrink-0" style={{ fontSize: 5, color: textSecondary }}>
        <span>9:41</span>
        <div className="flex gap-1 items-center">
          <span>●●●</span>
          <span>WiFi</span>
          <span>100%</span>
        </div>
      </div>

      {/* nav */}
      <div className="flex items-center justify-between px-2 py-1 flex-shrink-0" style={{ borderBottom: `1px solid ${t.screenBorder}` }}>
        <span className="font-extrabold" style={{ fontFamily: "'Syne',sans-serif", fontSize: 8, color: accent }}>
          NexCode
        </span>
        <div className="w-4 h-4 flex flex-col gap-0.5 justify-center">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-full" style={{ height: 1, background: textSecondary, width: i === 1 ? "60%" : "100%" }} />
          ))}
        </div>
      </div>

      {/* hero block */}
      <div className="flex flex-col items-center text-center px-2 pt-2.5 pb-2 gap-2 flex-shrink-0">
        <div
          className="rounded-full px-2 py-0.5 text-[5px] font-semibold"
          style={{ background: "rgba(79,123,255,0.15)", color: accent, border: "0.5px solid rgba(79,123,255,0.3)" }}
        >
          ● Available
        </div>
        <h1 className="font-extrabold leading-tight" style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, color: textPrimary }}>
          Empower Your{" "}
          <em className="not-italic" style={{ color: accent }}>
            Digital
          </em>{" "}
          Growth
        </h1>
        <p style={{ fontSize: 5.5, lineHeight: 1.5, color: textSecondary }}>Software that moves fast and scales further.</p>
        <button
          className="rounded-lg w-full font-semibold flex items-center justify-center gap-1"
          style={{ background: accent, color: "#fff", fontSize: 6, padding: "4px 0", border: "none" }}
        >
          <IcoRocket width={6} height={6} /> Build Your Project
        </button>
      </div>

      {/* stats strip */}
      <div
        className="flex justify-around px-2 py-1.5 flex-shrink-0"
        style={{ borderTop: `0.5px solid ${t.screenBorder}`, borderBottom: `0.5px solid ${t.screenBorder}` }}
      >
        {[
          ["98%", "Satisfaction"],
          ["150+", "Projects"],
          ["6yr", "Experience"],
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
      <div className="flex flex-col gap-1 px-2 pt-1.5">
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
            <div style={{ fontSize: 4.5, color: accent }}>87/100 · ↑ +12</div>
          </div>
          <div className="h-1 w-10 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="h-full rounded-full" style={{ width: "87%", background: accent }} />
          </div>
        </div>
      </div>
    </div>
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
                 flex flex-col items-center justify-center"
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
                      pointer-events-none select-none overflow-hidden"
        style={{ zIndex: 1 }}
      >
        <span
          className="font-extrabold uppercase leading-[0.90] tracking-[0.05em]"
          style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(5rem,15vw,14rem)", color: tokens.wm }}
        >
          Digital
        </span>
        <span
          className="font-extrabold uppercase leading-[0.90] tracking-[0.02em]"
          style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(5rem,15vw,14rem)", color: tokens.wm }}
        >
          Solutions
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative text-center px-5 pt-28 sm:pt-32 pb-10
                   flex flex-col items-center gap-4"
        style={{ zIndex: 10 }}
      >
        {/* headline */}
        <h1
          className="text-[clamp(2rem,5.2vw,3rem)] font-bold
                     leading-[1.05] tracking-tight text-foreground "
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Empower Your <em className="not-italic text-primary">Digital</em> Growth
        </h1>

        <p
          className="text-sm sm:text-base text-muted-foreground
                      leading-relaxed max-w-xl"
        >
          From sleek websites to powerful enterprise systems — NexCode ships software that moves fast, scales further, and delights every user.
        </p>
      </motion.div>

      {/* ══ DEVICE SCENE ════════════════════════════════════════ */}
      {/*
          Perspective wrapper → motion div (lid unfold) →
          tilt wrapper (mouse parallax) → laptop + floating cards
      */}
      <div
        className="relative z-10 w-full flex justify-center items-center"
        style={{ perspective: "1100px", minHeight: "86vh", paddingBottom: "10rem" }}
      >
        {/* lid unfold motion */}
        <motion.div
          animate={lidCtrl}
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "50% 80%" /* rotate around the base hinge */,
            willChange: "transform,opacity",
          }}
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
            >
              <div style={{ fontSize: 9, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Performance</div>
              <div className="flex items-end gap-1 mt-1">
                <span className="font-extrabold leading-none" style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, color: "var(--foreground)" }}>
                  87
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
              style={{
                top: "6%",
                left: "-13%",
                padding: "12px 14px",
                display: "flex",
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
                  24.8k
                </div>
                <div style={{ fontSize: 9, color: "var(--muted-foreground)", marginTop: 2 }}>Active users</div>
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
            >
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 9, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Revenue</span>
                <span style={{ fontSize: 9, color: "#22c55e", fontWeight: 700 }}>+32%</span>
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
              <div style={{ fontSize: 9, color: "var(--muted-foreground)" }}>Last 7 months</div>
            </FloatCard>

            {/* Deploy notif — bottom left */}
            <FloatCard
              delay={1.65}
              style={{
                bottom: "16%",
                left: "-25%",
                padding: "10px 12px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                transform: "translateZ(38px) rotateX(6deg) rotateY(8deg)",
                animation: "hfloat 5s ease-in-out 2.1s infinite",
              }}
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
                bottom: "1%",
                right: "-25%",
                padding: "10px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                transform: "translateZ(40px) rotateX(5deg) rotateY(-6deg)",
                animation: "hfloat 5s ease-in-out 1.1s infinite",
              }}
            >
              <div style={{ display: "flex" }}>
                {["#4f7bff", "#7c3aed", "#14b8a6", "#f97316"].map((c, i) => (
                  <div
                    key={i}
                    className="rounded-full border-2 flex-shrink-0"
                    style={{ width: 24, height: 24, background: c, borderColor: "var(--card)", marginLeft: i ? -8 : 0, zIndex: 4 - i }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 9, color: "var(--muted-foreground)" }}>
                <span style={{ fontWeight: 700, color: "var(--foreground)" }}>150+</span> happy clients
              </div>
            </FloatCard>

            {/* ── tech pills — orbit outside tilt wrap ── */}
            {[
              { Icon: IcoStack, label: "React + TypeScript", s: { top: "22%", left: "-14%" }, delay: 1.9 },
              { Icon: IcoDb, label: "Node.js API", s: { top: "50%", right: "-16%" }, delay: 2.1 },
              { Icon: IcoMonitor, label: "Cloud Deployed", s: { bottom: "22%", left: "36%" }, delay: 2.3 },
            ].map(({ Icon, label, s, delay: d }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: d, ease: [0.22, 1, 0.36, 1] }}
                className="absolute flex items-center gap-1.5 px-3 py-1.5 rounded-full
                           border border-border/40 bg-card/55 backdrop-blur-md
                           text-muted-foreground whitespace-nowrap pointer-events-none"
                style={{ fontSize: 10, animation: `hfloat 4s ease-in-out ${d - 1.9}s infinite` }}
              >
                <Icon width={10} height={10} style={{ color: "hsl(var(--primary))", flexShrink: 0 }} />
                {label}
              </motion.div>
            ))}
          </div>
          {/* tilt */}
        </motion.div>
        {/* lid unfold */}
      </div>
      {/* perspective */}

      {/* ══ STATS BAR ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 2.0, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-4 left-[2%] -translate-x-1/2 z-20
                   flex items-center rounded-2xl overflow-hidden
                   border border-border/40 bg-card/55 backdrop-blur-xl"
      >
        {displayStats.map((s, i) => (
          <div
            key={i}
            className="flex flex-col items-center px-6 py-3
                                   border-r border-border/30 last:border-0"
          >
            <span className="font-extrabold tracking-tight" style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, lineHeight: 1 }}>
              {s.value}
            </span>
            <span className="text-muted-foreground mt-1 uppercase tracking-wide" style={{ fontSize: 10 }}>
              {s.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* ── scroll hint ───────────────────────────────────────── */}
      <div
        className="absolute bottom-[1rem] right-6 z-20 hidden md:flex
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
