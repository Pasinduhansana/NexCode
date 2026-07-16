import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import { adSlides } from "../data/adSlides";
import { FaArrowRight } from "react-icons/fa";

function OfferCard({ offer, onCta }) {
  return (
    <div
      className="
        relative shrink-0
        w-[260px] sm:w-[300px] md:w-[520px]
        rounded-2xl border border-border bg-card
        shadow-sm hover:shadow-lg
        transition-shadow duration-300
        overflow-hidden
        flex flex-col
      "
    >
      {/* IMAGE — same treatment as AdModal: 1:1, object-contain, never cropped */}
      <div className="relative w-full aspect-square bg-muted overflow-hidden">
        <img
          src={offer.image}
          alt={offer.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
        />
      </div>

      <div className="p-5 sm:p-6 flex items-center justify-center">
        <Button
          variant="primary"
          className="
            group/cta
            w-full md:w-[200px]
            h-10 rounded-full font-semibold tracking-tight
            flex items-center justify-center gap-1.5
            px-4
          "
          onClick={() => onCta(offer)}
          rightIcon={<FaArrowRight />}
        >
          {offer.buttonText} 
        </Button>
      </div>
    </div>
  );
}

export default function OffersBanner({ offers = adSlides, speed = 32 }) {
  const [paused, setPaused] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const handleCta = (offer) => {
    // Open the story modal (AdModal) when an offer card is clicked.
    // AdModal listens to this sessionStorage flag.
    try {
      const slideIndex = offers.findIndex((s) => s.id === offer.id);
      sessionStorage.setItem("ad_modal_open", "true");
      sessionStorage.setItem("ad_modal_index", String(slideIndex >= 0 ? slideIndex : 0));
    } catch (_) {}

    // Keep existing behavior (route) as fallback/navigation.
    navigate("/start-project", { state: { ad: offer } });
  };

  // Duplicate the list once — the track animates from 0% to -50%,
  // and since the second half is an exact copy of the first, the
  // loop point is visually seamless.
  const trackItems = [...offers, ...offers];

  return (
    <section aria-label="Promotional offers" className="relative w-full py-8 sm:py-10">
      <div
        ref={wrapperRef}
        className="relative overflow-hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          maskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div
          className="flex gap-4 sm:gap-5 w-max offers-marquee-track"
          style={{
            animationDuration: `${speed}s`,
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {trackItems.map((offer, i) => (
            <OfferCard key={`${offer.id}-${i}`} offer={offer} onCta={handleCta} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes offers-marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .offers-marquee-track {
          animation-name: offers-marquee-scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .offers-marquee-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}