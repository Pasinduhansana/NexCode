import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function useGsapReveal() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const heroTimeline = gsap.timeline({ defaults: { duration: 0.55, ease: 'power2.out' } });

    heroTimeline
      .fromTo('[data-hero="0"]', { opacity: 0, y: 32 }, { opacity: 1, y: 0 })
      .fromTo('[data-hero="1"]', { opacity: 0, y: 32 }, { opacity: 1, y: 0 }, '-=0.35')
      .fromTo('[data-hero="2"]', { opacity: 0, y: 32 }, { opacity: 1, y: 0 }, '-=0.35')
      .fromTo('[data-hero="3"]', { opacity: 0, y: 32 }, { opacity: 1, y: 0 }, '-=0.35')
      .fromTo('[data-hero="4"]', { opacity: 0, y: 32 }, { opacity: 1, y: 0 }, '-=0.35')
      .fromTo('[data-hero-grid]', { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.75 }, '-=0.45');

    const revealEls = document.querySelectorAll('[data-reveal]');
    revealEls.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        }
      );
    });

    const staggerGroups = document.querySelectorAll('[data-reveal-stagger]');
    staggerGroups.forEach((group) => {
      const children = group.children;
      if (children.length) {
        gsap.fromTo(
          children,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.07,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: group,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }
    });

    const heroContent = document.querySelector('[data-parallax-hero]');
    if (heroContent) {
      const section = heroContent.closest('section');
      if (section) {
        gsap.to(heroContent, {
          y: '30%',
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);
}
