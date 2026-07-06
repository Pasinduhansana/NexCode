import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { adSlides } from "../data/adSlides";
import { FaArrowRight } from "react-icons/fa";
import Button from "./Button";

const SLIDE_DURATION = 5000;

export default function AdModal({ open, onClose, startIndex = 0 }) {
  const [index, setIndex] = useState(startIndex);

  const [animating, setAnimating] = useState(false);
  const [fillActive, setFillActive] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);

  const navigate = useNavigate();

  const startX = useRef(0);
  const deltaX = useRef(0);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      goNext();
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  // Drive the story-style progress fill for the active slide
  useEffect(() => {
    setFillActive(false);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setFillActive(true));
    });
    return () => cancelAnimationFrame(raf);
  }, [index, open]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, [open]);

  if (!open) return null;

  const goNext = () => {
    setAnimating(true);
    setIndex((p) => (p + 1) % adSlides.length);
    setTimeout(() => setAnimating(false), 250);
  };

  const goPrev = () => {
    setAnimating(true);
    setIndex((p) => (p - 1 + adSlides.length) % adSlides.length);
    setTimeout(() => setAnimating(false), 250);
  };

  const onPointerDown = (e) => {
    startX.current = e.clientX || e.touches?.[0]?.clientX;
  };

  const onPointerMove = (e) => {
    const currentX = e.clientX || e.touches?.[0]?.clientX;
    deltaX.current = currentX - startX.current;
  };

  const onPointerUp = () => {
    if (!isMobile) return;

    const threshold = 70;

    if (deltaX.current > threshold) goPrev();
    else if (deltaX.current < -threshold) goNext();

    startX.current = 0;
    deltaX.current = 0;
  };

  useEffect(() => {
    if (open) setIndex(startIndex);
  }, [open, startIndex]);

  const slide = adSlides[index];


  const handleCTA = () => {
    onClose();

    navigate("/start-project", {
      state: {
        ad: slide,
      },
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/55 backdrop-blur-md px-4 py-5 sm:px-6">
      {/* Close button — floats above the card, never clipped */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="
          mb-3 sm:mb-4
          w-9 h-9 sm:w-10 sm:h-10 rounded-full
          bg-white/10 hover:bg-white/20
          text-white
          flex items-center justify-center
          transition-colors
          shrink-0
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 sm:w-5 sm:h-5"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Modal — fixed layout, no internal scroll, on any viewport */}
      <div
        className="
        relative
        w-full
        max-w-[80vw]
        md:max-w-lg
        rounded-[20px]
        overflow-hidden
        bg-background
        border border-border
        shadow-2xl        "
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      >
        {/* IMAGE — 1:1 source, letterboxed via object-contain, never cropped */}
        <div
          className="
            relative md:w-full w-[80vw] h-[80vw] sm:h-[38vh]
            md:h-auto  md:aspect-square
            bg-muted overflow-hidden shrink-0
          "
        >
          {/* story-style progress bars */}
          <div className="absolute top-3 left-3 right-3 z-20 flex gap-1.5">
            {adSlides.map((_, i) => (
              <div key={i} className="h-[3px] flex-1 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{
                    width: i < index ? "100%" : i > index ? "0%" : fillActive ? "100%" : "0%",
                    transition: i === index ? `width ${SLIDE_DURATION}ms linear` : "none",
                  }}
                />
              </div>
            ))}
          </div>

          <img
            src={slide.image}
            alt={slide.title}
            className={`
              absolute inset-0 w-full h-full object-contain
              transition-transform duration-300
              ${animating ? "scale-105" : "scale-100"}
            `}
            draggable={false}
          />

          {!isMobile && (
            <>
              <button
                onClick={goPrev}
                aria-label="Previous"
                className="
                  absolute left-2.5 top-1/2 -translate-y-1/2 z-20
                  w-8 h-8 rounded-full
                  bg-black/25 hover:bg-black/40 backdrop-blur-sm
                  text-white
                  flex items-center justify-center
                  transition-colors
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <button
                onClick={goNext}
                aria-label="Next"
                className="
                  absolute right-2.5 top-1/2 -translate-y-1/2 z-20
                  w-8 h-8 rounded-full
                  bg-black/25 hover:bg-black/40 backdrop-blur-sm
                  text-white
                  flex items-center justify-center
                  transition-colors
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* CONTENT */}
        <div
          className="
            flex-1 min-w-0
            flex flex-col md:flex-row justify-between items-center md:items-center
            text-center md:text-left
            gap-2 sm:gap-2
            px-4 py-4 sm:px-4 sm:py-4 md:py-4 md:px-4 lg:px-4 lg:py-5
          "
        >
          <div>
            <span
              className="
              inline-flex items-center
              text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase
              text-primary bg-primary/10
              px-2.5 py-1 rounded-full
            "
            >
              Exclusive offer
            </span>

            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight leading-snug line-clamp-2">{slide.title}</h2>

            <p className="text-xs sm:text-sm text-text_secondary leading-relaxed line-clamp-2 md:max-w-[220px] lg:max-w-[240px]">
              Tailored for you — a limited-time offer designed around what you're building right now.
            </p>
          </div>

          <Button
            variant="primary"
            className="
              group w-full md:w-auto md:min-w-[150px]
              h-11 sm:h-12 mt-1
              rounded-full font-semibold tracking-tight
              flex items-center justify-center gap-2
            "
            onClick={handleCTA}
            rightIcon={<FaArrowRight />}
          >
            {slide.buttonText}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
