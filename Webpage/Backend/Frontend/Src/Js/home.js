const featured = document.querySelector(".featured");
const quote = document.querySelector(".content__text .highlight");
const sectionTitles = document.querySelectorAll(".container h1");
const introCard = document.querySelector(".intro-card");
const activityCards = document.querySelectorAll(".cards .card");

// Skip the animations for people who turned on "reduce motion" in their system settings
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const initSmoothScrolling = () => {
  // Initialize Lenis for smooth scroll effects. Lerp value controls the smoothness.
  const lenis = new Lenis({ lerp: 0.15 });

  // Ensure GSAP animations are in sync with Lenis' scroll frame updates.
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // Convert GSAP's time to milliseconds for Lenis.
  });

  // Turn off GSAP's default lag smoothing to avoid conflicts with Lenis.
  gsap.ticker.lagSmoothing(0);
};

// Fade in the featured project and the quote as soon as the page loads.
// The header is left alone on purpose: it's already on screen at the end of the intro page,
// so keeping it still makes the switch from intro.html to home.html look seamless.
const playPageIntro = () => {
  gsap
    .timeline({ delay: 0.1 })
    .fromTo(
      featured,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power4" }
    )
    .fromTo(
      featured.querySelectorAll(".featured__text > *"),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3", stagger: 0.08 },
      "-=0.9" // Start before the panel finishes
    );
};

// Fade elements up when they scroll into view
const revealOnScroll = (elements, options = {}) => {
  elements = [...elements];
  // Hide them first so they don't flash before animating
  gsap.set(elements, { y: 40, opacity: 0 });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        gsap.to(entry.target, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3",
          delay: options.stagger ? elements.indexOf(entry.target) * options.stagger : 0
        });
        observer.unobserve(entry.target); // Only animate once
      });
    },
    { threshold: 0.2 }
  );

  elements.forEach((el) => observer.observe(el));
};

// Initialization function
// (The activity cards' hover effect is pure CSS, in home.css)
const init = () => {
  initSmoothScrolling();
  if (reduceMotion) return;

  playPageIntro();
  revealOnScroll([quote, ...sectionTitles, introCard]);
  revealOnScroll(activityCards, { stagger: 0.1 });
};

init();
