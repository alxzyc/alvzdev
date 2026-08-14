const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/* ----------------------------------------------------------------
   Scroll narrative
   One passive listener invalidates a single animation-frame update.
   ---------------------------------------------------------------- */

const header = document.querySelector("[data-header]");
const scenes = [...document.querySelectorAll("[data-scroll-scene]")];
const manifesto = document.querySelector(".manifesto");
const manifestoLines = [...document.querySelectorAll(".manifesto-line")];
const manifestoNote = document.querySelector(".manifesto-note");
let scrollFrame = 0;

function updateScrollNarrative() {
  scrollFrame = 0;
  const viewportHeight = window.innerHeight;
  const isCompact = window.innerWidth <= 760;

  header.classList.toggle("is-scrolled", window.scrollY > 28);

  scenes.forEach((scene) => {
    const rect = scene.getBoundingClientRect();
    let progress;

    if (scene.classList.contains("hero")) {
      progress = clamp(-rect.top / Math.max(rect.height, viewportHeight));
    } else if (scene === manifesto) {
      progress = clamp(-rect.top / Math.max(rect.height - viewportHeight, 1));
    } else {
      progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height));
    }

    scene.style.setProperty("--scene-progress", progress.toFixed(4));

    const parallax = scene.querySelector("[data-parallax]");
    if (parallax && !reducedMotion && !isCompact) {
      const centered = progress - 0.5;
      scene.style.setProperty("--parallax-y", `${centered * -72}px`);
      scene.style.setProperty("--parallax-tilt", `${centered * 1.8}deg`);
    }
  });

  if (manifesto) {
    const progress = Number(manifesto.style.getPropertyValue("--scene-progress")) || 0;
    const starts = [0.04, 0.27, 0.5];

    manifestoLines.forEach((line, index) => {
      const lineProgress = clamp((progress - starts[index]) / 0.24);
      line.style.opacity = String(0.1 + lineProgress * 0.9);
      line.style.transform = reducedMotion ? "none" : `translate3d(0, ${(1 - lineProgress) * 3}rem, 0)`;
    });

    if (manifestoNote) {
      const noteProgress = clamp((progress - 0.66) / 0.2);
      manifestoNote.style.opacity = String(0.25 + noteProgress * 0.75);
      manifestoNote.style.transform = reducedMotion ? "none" : `translate3d(0, ${(1 - noteProgress) * 1.5}rem, 0)`;
    }
  }
}

function requestScrollUpdate() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollNarrative);
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate, { passive: true });
window.addEventListener("hashchange", requestScrollUpdate);

const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  }),
  { threshold: 0.12, rootMargin: "0px 0px -7%" },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

/* ----------------------------------------------------------------
   Carousels
   Autoplay pauses on hover, keyboard focus, document visibility and
   whenever the full-size image viewer is open.
   ---------------------------------------------------------------- */

let galleryPaused = false;
let suppressZoomUntil = 0;
const carousels = [];

document.querySelectorAll("[data-carousel]").forEach((root) => {
  const track = root.querySelector(".carousel-track");
  const slides = [...root.querySelectorAll(".carousel-slide")];
  const dotsRoot = root.querySelector(".carousel-dots");
  const previous = root.querySelector(".prev");
  const next = root.querySelector(".next");
  let activeIndex = 0;
  let touchStart = 0;
  let timer = 0;
  let locallyPaused = false;

  function goTo(index, restart = true) {
    activeIndex = (index + slides.length) % slides.length;
    track.style.transform = `translate3d(${-activeIndex * 100}%, 0, 0)`;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.inert = !isActive;
    });

    [...dotsRoot.children].forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });

    if (restart) play();
  }

  function stop() {
    window.clearInterval(timer);
    timer = 0;
  }

  function play() {
    stop();
    if (!reducedMotion && !galleryPaused && !locallyPaused && !document.hidden && slides.length > 1) {
      timer = window.setInterval(() => goTo(activeIndex + 1, false), 5600);
    }
  }

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Ir para imagem ${index + 1}`);
    dot.addEventListener("click", () => goTo(index));
    dotsRoot.append(dot);
  });

  previous.addEventListener("click", () => goTo(activeIndex - 1));
  next.addEventListener("click", () => goTo(activeIndex + 1));

  root.addEventListener("pointerenter", () => {
    locallyPaused = true;
    stop();
  });
  root.addEventListener("pointerleave", () => {
    locallyPaused = false;
    play();
  });
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget)) play();
  });

  root.addEventListener("touchstart", (event) => {
    touchStart = event.touches[0].clientX;
  }, { passive: true });
  root.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) > 44) {
      suppressZoomUntil = performance.now() + 500;
      goTo(activeIndex + (distance < 0 ? 1 : -1));
    }
  }, { passive: true });

  root.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") goTo(activeIndex - 1);
    if (event.key === "ArrowRight") goTo(activeIndex + 1);
  });

  goTo(0, false);
  play();
  carousels.push({ play, stop });
});

document.addEventListener("visibilitychange", () => {
  carousels.forEach((carousel) => document.hidden ? carousel.stop() : carousel.play());
});

/* ----------------------------------------------------------------
   Full-size project images
   ---------------------------------------------------------------- */

const lightbox = document.querySelector("#image-lightbox");
const lightboxImage = lightbox.querySelector(".lightbox-image");
const lightboxCounter = lightbox.querySelector(".lightbox-counter");
const lightboxTitle = lightbox.querySelector("[data-lightbox-title]");
const lightboxActions = lightbox.querySelector(".lightbox-actions");
const zoomItems = [...document.querySelectorAll("[data-lightbox-image]")];
let activeZoomItems = zoomItems;
let zoomIndex = 0;

function showZoom(index) {
  zoomIndex = (index + activeZoomItems.length) % activeZoomItems.length;
  const source = activeZoomItems[zoomIndex];
  const image = source.querySelector("img");
  lightboxImage.src = source.dataset.full || image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCounter.textContent = `${String(zoomIndex + 1).padStart(2, "0")} / ${String(activeZoomItems.length).padStart(2, "0")} · ${image.alt}`;
}

function openZoom(source) {
  const gallery = source.dataset.gallery || "Projeto";
  activeZoomItems = zoomItems.filter((item) => (item.dataset.gallery || "Projeto") === gallery);
  lightboxTitle.textContent = `${gallery} / galeria`;
  lightboxActions.hidden = activeZoomItems.length < 2;
  showZoom(activeZoomItems.indexOf(source));
  galleryPaused = true;
  carousels.forEach((carousel) => carousel.stop());
  lightbox.showModal();
}

zoomItems.forEach((item) => item.addEventListener("click", () => {
  if (performance.now() > suppressZoomUntil) openZoom(item);
}));

lightbox.querySelector("[data-lightbox-prev]").addEventListener("click", () => showZoom(zoomIndex - 1));
lightbox.querySelector("[data-lightbox-next]").addEventListener("click", () => showZoom(zoomIndex + 1));
lightbox.querySelector("[data-lightbox-close]").addEventListener("click", () => lightbox.close());

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showZoom(zoomIndex - 1);
  if (event.key === "ArrowRight") showZoom(zoomIndex + 1);
  if (event.key === "Escape") {
    event.preventDefault();
    lightbox.close();
  }
});

lightbox.addEventListener("close", () => {
  lightboxImage.removeAttribute("src");
  galleryPaused = false;
  carousels.forEach((carousel) => carousel.play());
});

/* ----------------------------------------------------------------
   Three.js hero — progressive enhancement
   ---------------------------------------------------------------- */

const crownCanvas = document.querySelector("#crown-canvas");
const crownFallback = document.querySelector(".crown-fallback");

import("./crown.js")
  .then(({ initCrown }) => {
    const crown = initCrown(crownCanvas, { reducedMotion });
    crownFallback.style.opacity = "0";
    window.addEventListener("pagehide", crown.dispose, { once: true });
  })
  .catch((error) => {
    console.info("WebGL indisponível; mantendo a composição estática da coroa.", error);
  });

updateScrollNarrative();
