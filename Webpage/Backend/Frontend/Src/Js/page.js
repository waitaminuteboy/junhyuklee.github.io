// Shared script for the inner pages (force plate project + activity pages)

const revealItems = document.querySelectorAll(".reveal");
const countItems = document.querySelectorAll("[data-count]");
const progressBar = document.querySelector(".progress");
const sensorMaps = document.querySelectorAll(".sensor-map");

// Skip the animations for people who turned on "reduce motion" in their system settings
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis;

const initSmoothScrolling = () => {
  // Initialize Lenis for smooth scroll effects. Lerp value controls the smoothness.
  lenis = new Lenis({ lerp: 0.15 });

  // Ensure GSAP animations are in sync with Lenis' scroll frame updates.
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // Convert GSAP's time to milliseconds for Lenis.
  });

  // Turn off GSAP's default lag smoothing to avoid conflicts with Lenis.
  gsap.ticker.lagSmoothing(0);

  // Smoothly scroll to sections when clicking links like href="#kaist"
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (ev) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      ev.preventDefault();
      lenis.scrollTo(target, { offset: -20 });
    });
  });
};

// Run a callback once, the first time each element scrolls into view
const onFirstView = (elements, callback, threshold = 0.15) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        callback(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold }
  );
  elements.forEach((el) => observer.observe(el));
};

// Fade elements up when they scroll into view.
// Elements that appear together are staggered so they come in one after another.
const initReveal = () => {
  let queue = [];
  let queued = false;

  onFirstView(revealItems, (el) => {
    queue.push(el);
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      gsap.fromTo(
        queue,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3", stagger: 0.1 }
      );
      queue = [];
      queued = false;
    });
  });
};

// Count numbers up from 0 (e.g. $2,700) when they scroll into view
const initCountUp = () => {
  onFirstView(
    countItems,
    (el) => {
      const target = Number(el.dataset.count);
      const prefix = el.dataset.prefix || "";
      const decimals = Number(el.dataset.decimals || 0);
      const counter = { value: 0 };
      gsap.to(counter, {
        value: target,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent =
            prefix +
            counter.value.toLocaleString("en-US", {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals
            });
        }
      });
    },
    0.6
  );
};

// Grow the cost comparison bars from the left when they scroll into view
const initCostBars = () => {
  const costs = document.querySelectorAll(".costs");
  costs.forEach((group) => gsap.set(group.querySelectorAll(".cost__bar"), { scaleX: 0 }));
  onFirstView(
    costs,
    (group) => {
      gsap.to(group.querySelectorAll(".cost__bar"), {
        scaleX: 1,
        duration: 1.4,
        ease: "power3.out",
        stagger: 0.2,
        delay: 0.3
      });
    },
    0.4
  );
};

// Pop the sensors onto the force plate diagrams one by one
const initSensorMaps = () => {
  sensorMaps.forEach((map) => gsap.set(map.querySelectorAll(".sensor"), { scale: 0 }));
  onFirstView(
    sensorMaps,
    (map) => {
      gsap.to(map.querySelectorAll(".sensor"), {
        scale: 1,
        duration: 0.5,
        ease: "back.out(2)",
        stagger: 0.12,
        delay: 0.3
      });
    },
    0.5
  );
};

// Bar at the top of the page that fills up as you scroll
const initProgressBar = () => {
  if (!progressBar) return;
  lenis.on("scroll", ({ progress }) => {
    gsap.set(progressBar, { scaleX: progress });
  });
};

// Click a photo to see it larger
const initLightbox = () => {
  const lightbox = document.querySelector(".lightbox");
  if (!lightbox) return;
  const lightboxImg = lightbox.querySelector(".lightbox__img");
  const lightboxCaption = lightbox.querySelector(".lightbox__caption");

  const open = (img) => {
    const caption = img.closest("figure")?.querySelector("figcaption");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = caption ? caption.textContent : img.alt;
    lightbox.hidden = false;
    lenis.stop();
    if (!reduceMotion) {
      gsap.fromTo(lightbox, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(lightboxImg, { scale: 0.92 }, { scale: 1, duration: 0.4, ease: "power3" });
    }
  };

  const close = () => {
    lightbox.hidden = true;
    lenis.start();
  };

  document.querySelectorAll(".figure img").forEach((img) => {
    img.addEventListener("click", () => open(img));
  });
  lightbox.addEventListener("click", (ev) => {
    if (ev.target !== lightboxImg) close();
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && !lightbox.hidden) close();
  });
};

// Initialization function
const init = () => {
  initSmoothScrolling();
  initProgressBar();
  initLightbox();

  if (reduceMotion) {
    gsap.set(revealItems, { opacity: 1 });
    return;
  }

  initReveal();
  initCountUp();
  initSensorMaps();
  initCostBars();
};

init();
