import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import palmLeave from "../../assets/palm-leave.png";
import project_image from "../../assets/project_image.png";
import project_image2_mobile from "../../assets/project_image1_mob.png";
import laptop_mockup from "../../assets/laptop_mockup.png";
import phone_mockup from "../../assets/phone_mockup.png";
import { useTheme } from "../context/ThemeContext";
import { showcaseProjects } from "../data/showcaseProjects";

import usePageTitle from "../utils/usePageTitle";
import Button from "../components/Button";
import SectionLabel from "../components/SectionLabel";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { HiArrowLeft } from "react-icons/hi";

const limitWords = (text, maxWords) => text.split(/\s+/).slice(0, maxWords).join(" ");

/* ------------------------------------------------------------------ */
/*  Tablet responsiveness notes (md/lg only):                          */
/*  Workspace-wide scope: ProjectDetailPage, HomePage, AboutPage,      */
/*  ServicesPage, ShowcasePage, ContactPage, ProjectRequestPage,        */
/*  PrivacyPolicyPage, TermsOfServicePage, plus shared components      */
/*  (Navbar, Footer, Hero, FeaturedProjects, ServiceCard, FAQ,         */
/*  AdModal, Offersbanner, ScrollToTop, Button, SectionLabel).         */
/*  Every page is reviewed for md/lg breakpoints; changes below are     */
/*  minimal md: classes only — mobile (<md) and desktop (>lg) remain    */
/*  preserved exactly.                                                 */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Shared motion hooks (no extra dependency required)                 */
/* ------------------------------------------------------------------ */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function useParallaxRef(speed = 20) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || speed === 0) return undefined;

    let frame = null;

    const update = () => {
      frame = null;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const center = rect.top + rect.height / 2;
      const progress = (viewportH / 2 - center) / viewportH; // -0.5 .. 0.5 roughly
      const offset = progress * speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (frame == null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [speed]);

  return ref;
}

/* ------------------------------------------------------------------ */
/*  Hero device stack: 3D tilt on pointer, cinematic unfold on load,    */
/*  ambient float + scroll drift for depth. Layout/classes preserved.  */
/* ------------------------------------------------------------------ */
function HeroDeviceStack({ laptop_mockup, phone_mockup, project_image, project_image2_mobile }) {
  const reducedMotion = usePrefersReducedMotion();
  const driftRef = useParallaxRef(reducedMotion ? 0 : -18);
  const [mounted, setMounted] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const tiltFrame = useRef(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleMouseMove = (e) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (tiltFrame.current) return;
    tiltFrame.current = requestAnimationFrame(() => {
      tiltFrame.current = null;
      const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ rx: py * -9, ry: px * 13 });
    });
  };

  const handleMouseLeave = () => setTilt({ rx: 0, ry: 0 });

  const tiltTransform = mounted
    ? `perspective(1400px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg)`
    : `perspective(1400px) rotateX(-68deg) translateY(50px)`;

  return (
    <div ref={driftRef} className="will-change-transform">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: tiltTransform,
          transformStyle: "preserve-3d",
          transformOrigin: "bottom center",
          opacity: mounted ? 1 : 0,
          transition: mounted ? "transform 0.5s cubic-bezier(0.16,1,0.3,1)" : "transform 1s cubic-bezier(0.16,1,0.3,1), opacity 0.9s ease-out",
        }}
        className="relative isolate mx-auto w-full max-w-[340px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[900px] [@media(min-width:1600px)]:max-w-[1000px] mb-10 md:my-5 perspective-[1000px] px-2 sm:px-0"
      >
        {/* Ambient glow — soft depth layer behind the devices */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[90px] ${
            reducedMotion ? "" : "animate-[heroGlow_6s_ease-in-out_infinite]"
          }`}
        />

        {/* Laptop Screen Bezel */}
        <div className="relative" style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
          <img src={laptop_mockup} alt="Laptop Mockup" className="w-full h-full relative z-20 drop-shadow-2xl" />
          <div className="absolute overflow-hidden w-[77%]  h-[84%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] ">
            <img
              src={project_image}
              alt="Project Screenshot"
              className="z-10 transform transition-transform duration-300 hover:scale-105 w-full h-full"
            />
            {/* subtle glass glare on hover */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-500 hover:opacity-100" />
          </div>
        </div>

        {/* Phone Screen */}
        <div
          className={`absolute bottom-0 left-0 w-[60px] sm:w-[120px] h-auto mt-10 z-50 ${
            reducedMotion ? "" : "animate-[heroFloat_4.5s_ease-in-out_infinite]"
          }`}
          style={{ transform: "translateZ(60px)", animationDelay: "0.3s" }}
        >
          <img src={phone_mockup} alt="Phone Mockup" className="w-full  h-full relative z-20 drop-shadow-xl" />
          <div className="absolute overflow-hidden bg-background w-[99%] h-[99%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-[50.5%] rounded-lg lg:rounded-3xl ">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-8 bg-muted rounded-full">
              <div className="flex justify-between px-3 pt-0">
                <span className="text-foreground text-[4px] font-semibold">Dialog</span>
                <div className="flex">
                  <span className="text-foreground text-[4px] mr-1">📶</span>
                  <span className="text-foreground text-[4px] font-semibold">100%</span>
                </div>
              </div>
            </div>
            <img
              src={project_image2_mobile}
              alt="Project Screenshot"
              className="z-10 pt-6 transform transition-transform duration-300 hover:scale-105 w-full h-full"
            />
          </div>
        </div>

        {/* Grounding shadow — reacts subtly to tilt for a physical feel */}
        <div
          aria-hidden="true"
          className="absolute -bottom-6 left-1/2 h-6 w-[70%] rounded-full bg-black/30 blur-xl transition-transform duration-300"
          style={{ transform: `translateX(-50%) scaleX(${1 - Math.min(Math.abs(tilt.ry) / 60, 0.25)})` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating gallery card (image or video thumbnail)                   */
/* ------------------------------------------------------------------ */
function GalleryCard({ item, index, onOpen }) {
  const direction = index % 2 === 0 ? 1 : -1;
  const depth = 16 + (index % 3) * 10; // 16 / 26 / 36 px of drift
  const parallaxRef = useParallaxRef(direction * depth);

  return (
    <div ref={parallaxRef} className={`will-change-transform ${index % 2 === 1 ? "sm:translate-y-6" : ""}`}>
      <button
        type="button"
        onClick={onOpen}
        className="group relative block w-full aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card text-left"
      >
        <img
          src={item.type === "video" ? item.thumbnail : item.url}
          alt={item.caption || "Project media"}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/40" />

        {item.type === "video" ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-300 group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 text-slate-900" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2">
                <path
                  d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        )}

        {item.caption && (
          <p className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {item.caption}
          </p>
        )}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Fullscreen lightbox: swipe / arrow navigation + video playback      */
/* ------------------------------------------------------------------ */
function MediaLightbox({ media, index, onClose, onPrev, onNext }) {
  const touchStartX = useRef(null);
  const current = media[index];

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose, onPrev, onNext]);

  if (!current) return null;

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta > 0) onPrev();
      else onNext();
    }
    touchStartX.current = null;
  };

  const isEmbed = current.type === "video" && (current.url.includes("youtube") || current.url.includes("embed"));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 z-20 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>

      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous"
            className="absolute left-3 z-20 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:left-8"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next"
            className="absolute right-3 z-20 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-8"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      <div
        className="relative flex w-full max-w-5xl flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {current.type === "video" ? (
          isEmbed ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                key={current.url}
                src={`${current.url}${current.url.includes("?") ? "&" : "?"}autoplay=1`}
                title={current.caption || "Project video"}
                className="h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video key={current.url} src={current.url} controls autoPlay className="max-h-[70vh] w-full rounded-xl bg-black" />
          )
        ) : (
          <img
            src={current.url}
            alt={current.caption || "Project media"}
            draggable={false}
            className="max-h-[70vh] max-w-full select-none rounded-xl object-contain"
          />
        )}

        {current.caption && <p className="max-w-2xl px-4 text-center text-sm text-white/70">{current.caption}</p>}

        {media.length > 1 && (
          <div className="flex items-center gap-1.5">
            {media.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/30"}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
function App() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const { theme } = useTheme();
  const reducedMotion = usePrefersReducedMotion();
  const navigate = useNavigate();

  const watermarkRef = useParallaxRef(reducedMotion ? 0 : -34);
  const palmRef = useParallaxRef(reducedMotion ? 0 : 22);

  useEffect(() => {
    let mounted = true;

    const loadProject = async () => {
      if (mounted) {
        setProject(showcaseProjects.find((item) => item.slug === slug));
        setLoading(false);
      }
    };

    loadProject();

    return () => {
      mounted = false;
    };
  }, [slug]);

  usePageTitle(project ? `${project.name} | Showcase` : "Project Not Found");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return <Navigate to="/showcase" replace />;
  }

  const relatedProjects = (project.relatedSlugs ?? [])
    .map((relatedSlug) => showcaseProjects.find((item) => item.slug === relatedSlug))
    .filter(Boolean);
  const summaryText = limitWords(project.summary, 60);
  const whatIsText = limitWords(project.whatIs, 28);
  const whyDevelopedText = limitWords(project.whyDeveloped, 30);
  const businessValueText = limitWords(project.businessValue, 30);
  const challengeText = limitWords(project.challengeBefore, 30);
  const relatedSummary = (text) => limitWords(text, 28);
  const watermarkColor = theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(17, 24, 39, 0.2)";

  // Combine images + videos from the (optional) resources block into one
  // ordered media list so the lightbox can navigate across both types.
  const galleryImages = project.resources?.images ?? [];
  const galleryVideos = project.resources?.videos ?? [];
  const media = [
    ...galleryVideos.map((vid) => ({
      type: "video",
      url: vid.url,
      thumbnail: vid.thumbnail,
      caption: vid.caption,
    })),
    ...galleryImages.map((img) => ({ type: "image", url: img.url, caption: img.caption })),
  ];

  const videoMedia = media.filter((m) => m.type === "video");
  const imageMedia = media.filter((m) => m.type === "image");

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const goPrev = () => setLightboxIndex((i) => (i - 1 + media.length) % media.length);
  const goNext = () => setLightboxIndex((i) => (i + 1) % media.length);

  return (
    <>
      {/* Self-contained keyframes for the hero's motion — no Tailwind config changes needed */}
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateZ(60px) translateY(0); }
          50% { transform: translateZ(60px) translateY(-10px); }
        }
        @keyframes heroGlow {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2.5deg); }
        }
      `}</style>

      <div className="flex flex-col h-full -mt-20">
        {/* Hero Section */}
        <div
          className={`relative w-full h-full gap-4 md:gap-0 md:pb-0 md:min-h-screen bg-hero-gradient text-white overflow-x-hidden overflow-y-visible flex flex-col items-center justify-between md:py-10 pt-20 px-5 z-10 select-none`}
        >

          {/* Background Watermark Text Layer — drifts on scroll for depth */}
          <div
            ref={watermarkRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 md:-translate-y-[48%] -translate-y-[53%] scale-[0.70] md:scale-[0.62] sm:scale-75 lg:scale-100 w-full lg:max-w-[1200px] [@media(min-width:1600px)]:scale-125 flex flex-col items-center justify-center -z-10 pointer-events-none will-change-transform"
          >
            <span
              className={`text-[6rem] md:text-[12rem] font-extrabold tracking-wider leading-[0.95] text-center uppercase`}
              style={{ color: watermarkColor }}
            >
              project
            </span>
            <span
              className={`text-[6rem] md:text-[12rem] font-extrabold tracking-wider leading-[0.95] text-center uppercase`}
              style={{ color: watermarkColor }}
            >
              Overview
            </span>
          </div>

          <div className="absolute w-full max-w-7xl mx-auto top-10 pt-10 pl-5">
            <Button
              variant="ghost"
              className={"text-text_primary border-border_hard border"}
              size="sm"
              onClick={() => {
                if (window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate("/showcase");
                }
              }}
              leftIcon={<HiArrowLeft/>}
            >
              Back
            </Button>
          </div>

          {/* Brand Header */}
          <header
            className="text-center mt-10"
            style={reducedMotion ? undefined : { animation: "heroFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "0.05s" }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text_primary opacity-100">{project.name}</h1>
            <p className="text-[10px] tracking-[4px] mt-1 text-text_muted font-medium opacity-100">WEB ELEMENTS RESOURCE</p>
          </header>

          {/* Central Interactive Content Frame */}
          <main className="flex flex-col items-center w-full mt-5 md:mt-0">
            <HeroDeviceStack
              laptop_mockup={laptop_mockup}
              phone_mockup={phone_mockup}
              project_image={theme === "dark" ? project.laptop_mockup?.[1] : project.laptop_mockup?.[0]}
              project_image2_mobile={theme === "dark" ? project.phone_mockup?.[1] : project.phone_mockup?.[0]}
            />

            {/* Dynamic Presentation Typography */}
            <div
              className="text-center my-5 md:my-10"
              style={reducedMotion ? undefined : { animation: "heroFadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "0.85s" }}
            >
              <p className="text-[11px] tracking-[5px] text-text_muted mb-3.5 uppercase font-semibold">SELECTED PROJECT DETAILS</p>
              <p className="text-l md:text-[18px] max-w-[800px] font-normal leading-relaxed text-text_primary opacity-95 balance line-clamp-2">
                {project.summary}
              </p>
            </div>
          </main>

          {/* Decorative Overlapping Foreground Botanical Corner Asset - right */}
          <div
            ref={palmRef}
            className="absolute -bottom-5 right-10 hidden sm:block -translate-x-1/5 w-[400px] h-auto mb-[8%] pointer-events-none z-30 transform select-none will-change-transform"
          >
            {/* Adding Shadow for Depth and Visual Interest (sent behind the image) */}
            <div className="absolute bottom-4 left-[43%] z-0 w-20 h-5 bg-black/80 rounded-lg filter blur-lg opacity-70"></div>
            <img
              src={palmLeave}
              alt="Decorative Palm Corner Graphic"
              className={`w-full h-auto relative z-20 origin-bottom-left ${reducedMotion ? "" : "animate-[heroSway_7s_ease-in-out_infinite]"}`}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full bg-background px-5 py-10 text-foreground text-center md:text-left lg:text-left">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-7 lg:px-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-start justify-items-center md:justify-items-stretch">
              <div className="md:col-span-8 flex flex-col gap-6 items-center md:items-start lg:items-start">
                <div>
                  <p className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-3 text-text_muted">Case Study</p>
                  <h2 className="text-2xl md:text-3xl font-semibold leading-tight line-clamp-2 text-text_primary">{project.name}</h2>
                  <p className="mt-3 text-sm md:text-[15px] text-text_muted leading-relaxed mx-auto md:mx-0">
                    {isSummaryExpanded ? project.summary : summaryText}
                    {!isSummaryExpanded && summaryText.length < project.summary.length ? (
                      <Button variant="link" onClick={() => setIsSummaryExpanded(true)}>
                        Read more
                      </Button>
                    ) : null}
                    {isSummaryExpanded ? (
                      <Button variant="link" onClick={() => setIsSummaryExpanded(false)}>
                        Show less
                      </Button>
                    ) : null}
                  </p>
                </div>

                <div className="py-4">
                  <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-2.5 text-text_primary">What the project is</p>
                  <p className="text-sm md:text-[15px] text-text_muted leading-relaxed">{whatIsText}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-2 text-text_primary">Why it was developed</p>
                    <p className="text-sm text-text_muted leading-relaxed">{whyDevelopedText}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-2 text-text_primary">Business value</p>
                    <p className="text-sm text-text_muted leading-relaxed">{businessValueText}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 justify-center md:justify-start lg:justify-start">
                  {project.stack.map((tech) => (
                    <span key={tech} className="px-3.5 py-1.5 rounded-full bg-none text-[12px] font-medium text-foreground border border-border_hard">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-4 min-h-0 grid gap-3.5">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-2.5 text-text_primary">Client challenge</p>
                  <p className="text-sm text-text_muted leading-relaxed">{challengeText}</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-2.5 text-text_primary">Project outcomes</p>
                  <div className="space-y-2">
                    {project.outcomes.map((item) => (
                      <div key={item} className="flex items-start gap-2.5 text-sm text-text_muted leading-snug text-left">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                        <span>{limitWords(item, 14)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-2.5 text-text_primary">Measured results</p>
                  <div className="space-y-2">
                    {project.results.map((result) => (
                      <div key={result} className="flex items-start gap-2.5 text-sm text-text_muted leading-snug">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                        <span>{result}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="primary" to={"/contact"}>
                  Request Similar Solution
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 mb-5">
                <div>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-text_muted font-semibold mb-1">Feature list</p>
                  <h3 className="text-lg font-semibold text-text_primary">What this solution includes</h3>
                </div>
                <div className="text-sm text-text_muted">{project.features.length} core capabilities</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3.5 text-left">
                {project.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <span className="text-[13px] pt-0.5 w-4">
                      {index + 1}
                      {"."}
                    </span>
                    <span className="text-sm text-foreground leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Media Gallery */}
            {media.length > 0 && (
              <div className="pt-2 space-y-10">
                {videoMedia.length > 0 && (
                  <div>
                    <div className="flex items-end justify-between gap-4 mb-6">
                      <div>
                        <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-1 text-text_muted">Video gallery</p>
                        <h3 className="text-lg font-semibold text-foreground">Watch it in action</h3>
                      </div>
                      <div className="text-sm text-text_muted hidden sm:block">{videoMedia.length} items &middot; tap to play</div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[140px] sm:auto-rows-[170px] md:auto-rows-[160px] gap-3 sm:gap-4 md:gap-5 lg:gap-4 grid-flow-row-dense">
                      {videoMedia.map((item, i) => {
                        const pattern = i % 6;
                        const spanClass = pattern === 0 ? "col-span-2 row-span-2" : pattern === 3 ? "row-span-2" : "";

                        return (
                          <button
                            key={`video-${i}`}
                            type="button"
                            onClick={() => openLightbox(media.indexOf(item))}
                            className={`group relative overflow-hidden rounded-2xl border border-border bg-card ${spanClass}`}
                          >
                            <img
                              src={item.thumbnail}
                              alt={item.caption || "Project video"}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                            />

                            {/* darken base so play button always reads clearly */}
                            <div className="absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/40" />

                            {/* bottom gradient scrim for caption */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                            {/* play button */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/40 transition-transform duration-300 group-hover:scale-110">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
                                  <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 text-slate-900" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            {/* video tag */}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
                              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                              Video
                            </div>

                            {item.caption && <p className="absolute inset-x-0 bottom-0 p-3 text-xs text-white truncate">{item.caption}</p>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {imageMedia.length > 0 && (
                  <div>
                    <div className="flex items-end justify-between gap-4 mb-6">
                      <div>
                        <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-1 text-text_muted">Image gallery</p>
                        <h3 className="text-lg font-semibold text-foreground">See it in action</h3>
                      </div>
                      <div className="text-sm text-text_muted hidden sm:block">{imageMedia.length} items &middot; tap to expand</div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[140px] sm:auto-rows-[170px] md:auto-rows-[160px] gap-3 sm:gap-4 md:gap-5 lg:gap-4 grid-flow-row-dense">
                      {imageMedia.map((item, i) => {
                        const pattern = i % 6;
                        const spanClass = pattern === 0 ? "col-span-2 row-span-2" : pattern === 3 ? "row-span-2" : "";

                        return (
                          <button
                            key={`image-${i}`}
                            type="button"
                            onClick={() => openLightbox(media.indexOf(item))}
                            className={`group relative overflow-hidden rounded-2xl border border-border bg-card ${spanClass}`}
                          >
                            <img
                              src={item.url}
                              alt={item.caption || "Project media"}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                            />

                            {/* gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                            {/* caption */}
                            {item.caption && (
                              <p className="absolute inset-x-0 bottom-0 p-3 text-xs text-white truncate opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                {item.caption}
                              </p>
                            )}

                            {/* expand icon */}
                            <div className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 opacity-0 scale-75 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
                              <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2">
                                <path
                                  d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2">
              <div className="flex items-end justify-between gap-4 mb-5">
                <div>
                  <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-1 text-text_muted">Related projects</p>
                  <h3 className="text-lg font-semibold text-foreground">Explore similar solutions</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {relatedProjects.map((relatedProject) => (
                  <Link
                    key={relatedProject.slug}
                    to={`/showcase/${relatedProject.slug}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      <img
                        src={relatedProject.resources?.images?.[0]?.url ?? relatedProject.cover}
                        alt={"relatedProject.name"}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-2 text-text_muted">{relatedProject.type}</div>
                      <h4 className="text-base font-semibold text-foreground group-hover:text-primary">{relatedProject.name}</h4>
                      <p className="mt-2 text-sm text-text_muted line-clamp-3">{relatedSummary(relatedProject.summary)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && <MediaLightbox media={media} index={lightboxIndex} onClose={closeLightbox} onPrev={goPrev} onNext={goNext} />}
    </>
  );
}

export default App;
