import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { adSlides } from "../data/adSlides";
import Button from "./Button";

export default function AdModal({ open, onClose }) {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const navigate = useNavigate();

  const startX = useRef(0);
  const deltaX = useRef(0);

  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      goNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [open, index]);

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md px-4">

      {/* Modal */}
      <div
        className="
          relative  max-w-3xl 
          rounded-2xl overflow-hidden
          shadow-2xl
          border border-border
          bg-background
          text-foreground
        "
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      >

        {/* Close */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4 z-30
            w-9 h-9 rounded-full
            bg-muted/70 hover:bg-muted
            text-text_secondary hover:text-foreground
            flex items-center justify-center
          "
        >
          ✕
        </button>

        {/* IMAGE AREA */}
        <div className="relative h-[60vh] md:h-[70vh] p-1 bg-muted overflow-hidden">

          <img
            src={slide.image}
            alt={slide.title}
            className={`
              w-full h-full object-cover rounded-xl
              transition-transform duration-300
              ${animating ? "scale-105" : "scale-100"}
            `}
            draggable={false}
          />



          {/* DESKTOP: Arrows */}
          {!isMobile && (
            <>
              <button
                onClick={goPrev}
                className="
                  absolute left-3 top-1/2 -translate-y-1/2
                  w-10 h-10 rounded-full
                  bg-card hover:bg-card-gradient
                  text-foreground border-border border
                  flex items-center justify-center
                "
              >
                ←
              </button>

              <button
                onClick={goNext}
                className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  w-10 h-10 rounded-full
                  bg-card hover:bg-card-gradient
                  text-foreground border-border border
                  flex items-center justify-center
                "
              >
                →
              </button>
            </>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-5 pt-2 space-y-4 flex flex-col text-center md:text-left md:flex-row justify-center md:justify-between items-center">

          <div>
            <h2 className="text-lg font-semibold">{slide.title}</h2>
            <p className="text-sm text-text_secondary ">
              Exclusive offer tailored for you
            </p>
          </div>

          <Button
            variant="primary"
            className="w-[200px] h-auto "
            onClick={handleCTA}
          >
            {slide.buttonText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}