/**
 * ALVZ.DEV — Japanese Editorial Portfolio
 * Vanilla JS: scroll narrative, carousels, lightbox, 3D netsuke, reveals
 */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const prefersContrast = window.matchMedia("(prefers-contrast: more)").matches;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;

/* ================================================================
   SCROLL NARRATIVE
   Single rAF frame, passive listeners
   ================================================================ */

const header = document.querySelector("[data-header]");
const scrollScenes = [...document.querySelectorAll("[data-scroll-scene]")];
const manifestoLines = [...document.querySelectorAll(".manifesto-line")];
const manifestoBody = document.querySelector(".manifesto-body");
const manifestoSeal = document.querySelector(".manifesto-seal");
const contactSeal = document.querySelector(".contact-seal");
const heroNetsuke = document.querySelector(".hero-netsuke");

let scrollFrame = 0;
let lastScrollY = window.scrollY;
let scrollDirection = "down";

function updateScrollNarrative() {
  scrollFrame = 0;
  const viewportHeight = window.innerHeight;
  const isCompact = window.innerWidth <= 768;

  const scrolled = window.scrollY > 28;
  header.classList.toggle("is-scrolled", scrolled);

  const totalScroll = document.documentElement.scrollHeight - viewportHeight;
  const globalProgress = totalScroll > 0 ? window.scrollY / totalScroll : 0;

  /* ── Hero netsuke parallax ── */
  if (heroNetsuke && !prefersReducedMotion && !isCompact) {
    const heroRect = heroNetsuke.closest(".hero")?.getBoundingClientRect();
    if (heroRect) {
      const heroProgress = clamp(-heroRect.top / Math.max(heroRect.height, viewportHeight));
      const centered = heroProgress - 0.5;
      const translateY = centered * -40;
      const rotateY = centered * 15;
      const rotateX = centered * -5;
      heroNetsuke.style.transform = `translate3d(0, ${translateY}px, 0) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    }
  }

  /* ── Scroll scenes progress ── */
  scrollScenes.forEach((scene) => {
    const rect = scene.getBoundingClientRect();
    let progress;

    if (scene.classList.contains("hero")) {
      progress = clamp(-rect.top / Math.max(rect.height, viewportHeight));
    } else if (scene.classList.contains("manifesto")) {
      progress = clamp(-rect.top / Math.max(rect.height - viewportHeight, 1));
    } else if (scene.classList.contains("projects")) {
      progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height));
    } else if (scene.classList.contains("skills")) {
      progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height));
    } else if (scene.classList.contains("contact")) {
      progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height));
    } else {
      progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height));
    }

    scene.style.setProperty("--scene-progress", progress.toFixed(4));

    if (!prefersReducedMotion && !isCompact) {
      const parallaxEl = scene.querySelector("[data-parallax]");
      if (parallaxEl) {
        const centered = progress - 0.5;
        scene.style.setProperty("--parallax-y", `${centered * -32}px`);
        scene.style.setProperty("--parallax-tilt", `${centered * 1.2}deg`);
      }
    }
  });

  /* ── Manifesto line reveals ── */
  if (manifestoLines.length) {
    const manifestoScene = document.querySelector(".manifesto");
    if (manifestoScene) {
      const progress = Number(manifestoScene.style.getPropertyValue("--scene-progress")) || 0;
      const starts = [0.15, 0.35, 0.55];

      manifestoLines.forEach((line, index) => {
        const lineProgress = clamp((progress - starts[index]) / 0.25);
        if (lineProgress > 0 && !line.classList.contains("is-visible")) {
          line.classList.add("is-visible");
        }
      });

      if (manifestoBody) {
        const bodyProgress = clamp((progress - 0.6) / 0.2);
        if (bodyProgress > 0.5 && !manifestoBody.classList.contains("is-visible")) {
          manifestoBody.classList.add("is-visible");
        }
      }

      if (manifestoSeal) {
        const sealProgress = clamp((progress - 0.75) / 0.2);
        if (sealProgress > 0.5 && !manifestoSeal.classList.contains("is-visible")) {
          manifestoSeal.classList.add("is-visible");
        }
      }
    }
  }

  /* ── Contact seal ── */
  if (contactSeal) {
    const contactScene = document.querySelector(".contact");
    if (contactScene) {
      const progress = Number(contactScene.style.getPropertyValue("--scene-progress")) || 0;
      if (progress > 0.85 && !contactSeal.classList.contains("is-visible")) {
        contactSeal.classList.add("is-visible");
      }
    }
  }

  /* ── Reveal observer fallback for non-scroll scenes ── */
  lastScrollY = window.scrollY;
}

function requestScrollUpdate() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollNarrative);
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate, { passive: true });
window.addEventListener("hashchange", requestScrollUpdate);

/* Initial check */
requestAnimationFrame(updateScrollNarrative);

/* ================================================================
   INTERSECTION OBSERVER REVEALS
   ================================================================ */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -50px" }
);

document.querySelectorAll(".reveal, .reveal-stagger, .manifesto-line, .manifesto-seal, .contact-seal").forEach((el) => revealObserver.observe(el));

/* ── Interactive Woodblock Art Mount Tilt ── */
if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
  const tiltMounts = document.querySelectorAll(".hero-art-mount, .manifesto-art-frame, .contact-art-frame");
  tiltMounts.forEach((mount) => {
    mount.addEventListener("mousemove", (e) => {
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
      mount.style.transform = `perspective(1000px) rotateX(${y.toFixed(2)}deg) rotateY(${x.toFixed(2)}deg)`;
    });
    mount.addEventListener("mouseleave", () => {
      mount.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    });
  });
}

/* ================================================================
   CAROUSELS SYSTEM
   ================================================================ */

let galleryPaused = false;
let activeCarousels = [];

function setupAllCarousels() {
  activeCarousels.forEach(c => c.stopAutoplay());
  activeCarousels = [];

  document.querySelectorAll("[data-carousel]").forEach((root) => {
    const track = root.querySelector(".carousel-track");
    const slides = [...root.querySelectorAll(".carousel-slide")];
    const dotsRoot = root.querySelector(".carousel-dots");
    const prevBtn = root.querySelector(".carousel-arrow.prev");
    const nextBtn = root.querySelector(".carousel-arrow.next");
    let activeIndex = 0;
    let touchStartX = 0;
    let touchStartIndex = 0;
    let autoplayTimer = null;
    const slideCount = slides.length;

    if (dotsRoot) {
      dotsRoot.innerHTML = "";
      if (slideCount > 1) {
        slides.forEach((_, i) => {
          const dot = document.createElement("button");
          dot.className = "carousel-dot" + (i === 0 ? " is-active" : "");
          dot.type = "button";
          dot.setAttribute("aria-label", `Ir para slide ${i + 1}`);
          dot.addEventListener("click", () => goToSlide(i));
          dotsRoot.appendChild(dot);
        });
      }
    }

    const dots = [...dotsRoot?.querySelectorAll(".carousel-dot")] || [];

    function updateDots() {
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === activeIndex));
    }

    function goToSlide(index) {
      if (index < 0) index = slideCount - 1;
      if (index >= slideCount) index = 0;
      activeIndex = index;
      if (track) track.style.transform = `translateX(-${activeIndex * 100}%)`;
      updateDots();
    }

    function nextSlide() { goToSlide(activeIndex + 1); }
    function prevSlide() { goToSlide(activeIndex - 1); }

    if (prevBtn) prevBtn.onclick = prevSlide;
    if (nextBtn) nextBtn.onclick = nextSlide;

    function startAutoplay() {
      if (slideCount <= 1) return;
      stopAutoplay();
      autoplayTimer = setInterval(() => {
        if (!galleryPaused && !document.hidden) nextSlide();
      }, 4500);
    }

    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = null;
    }

    root.onmouseenter = () => { galleryPaused = true; };
    root.onmouseleave = () => { galleryPaused = false; };
    root.onfocusin = () => { galleryPaused = true; };
    root.onfocusout = () => { galleryPaused = false; };

    root.ontouchstart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartIndex = activeIndex;
    };

    root.ontouchend = (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        goToSlide(touchStartIndex + (dx < 0 ? 1 : -1));
      }
    };

    root.onkeydown = (e) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };

    activeCarousels.push({ root, stopAutoplay, startAutoplay });
    startAutoplay();
  });
}

document.addEventListener("visibilitychange", () => {
  galleryPaused = document.hidden;
});

/* Pause all carousels when lightbox opens */
const lightbox = document.getElementById("image-lightbox");
if (lightbox) {
  const originalShow = lightbox.showModal.bind(lightbox);
  const originalClose = lightbox.close.bind(lightbox);
  lightbox.showModal = function(...args) {
    activeCarousels.forEach(c => c.stopAutoplay());
    return originalShow(...args);
  };
  lightbox.close = function(...args) {
    activeCarousels.forEach(c => c.startAutoplay());
    return originalClose(...args);
  };
}

/* ================================================================
   LIGHTBOX
   ================================================================ */

const lightboxEl = document.getElementById("image-lightbox");
const lightboxImage = lightboxEl?.querySelector(".lightbox-image");
const lightboxCaption = lightboxEl?.querySelector(".lightbox-caption");
const lightboxCounter = lightboxEl?.querySelector(".lightbox-counter");
const lightboxTitle = lightboxEl?.querySelector("[data-lightbox-title]");
const lightboxClose = lightboxEl?.querySelector("[data-lightbox-close]");
const lightboxPrev = lightboxEl?.querySelector("[data-lightbox-prev]");
const lightboxNext = lightboxEl?.querySelector("[data-lightbox-next]");

let currentGallery = [];
let currentIndex = 0;
let lastFocused = null;

function openLightbox(galleryName, index, title) {
  currentGallery = [...document.querySelectorAll(`[data-lightbox-image][data-gallery="${galleryName}"]`)];
  currentIndex = index;
  lastFocused = document.activeElement;

  if (!currentGallery.length) return;

  updateLightbox();
  lightboxEl.showModal();
  lightboxClose?.focus();

  document.addEventListener("keydown", handleLightboxKeydown);
  bodyScrollLock(true);
}

function closeLightbox() {
  lightboxEl.close();
  document.removeEventListener("keydown", handleLightboxKeydown);
  bodyScrollLock(false);
  lastFocused?.focus();
  lastFocused = null;
}

function updateLightbox() {
  const btn = currentGallery[currentIndex];
  if (!btn) return;

  const img = btn.querySelector("img");
  const fullSrc = btn.dataset.full;
  const caption = btn.getAttribute("aria-label") || "";
  const galleryName = btn.dataset.gallery || "";

  lightboxImage.src = fullSrc || img?.src || "";
  lightboxImage.alt = img?.alt || "";
  lightboxCaption.textContent = caption;
  lightboxCaption.hidden = !caption;
  lightboxCounter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
  lightboxTitle.textContent = galleryName;
}

function navigateLightbox(delta) {
  currentIndex = (currentIndex + delta + currentGallery.length) % currentGallery.length;
  updateLightbox();
}

function handleLightboxKeydown(e) {
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") navigateLightbox(-1);
  if (e.key === "ArrowRight") navigateLightbox(1);
  if (e.key === "Tab") trapFocus(e);
}

function trapFocus(e) {
  const focusable = lightboxEl.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function bodyScrollLock(lock) {
  document.body.style.overflow = lock ? "hidden" : "";
}

function setupLightboxTriggers() {
  document.querySelectorAll("[data-lightbox-image]").forEach((btn) => {
    btn.onclick = () => {
      const gallery = btn.dataset.gallery;
      const index = [...document.querySelectorAll(`[data-lightbox-image][data-gallery="${gallery}"]`)].indexOf(btn);
      openLightbox(gallery, index, gallery);
    };
  });
}

setupLightboxTriggers();

lightboxClose?.addEventListener("click", closeLightbox);
lightboxPrev?.addEventListener("click", () => navigateLightbox(-1));
lightboxNext?.addEventListener("click", () => navigateLightbox(1));

lightboxEl?.addEventListener("click", (e) => {
  if (e.target === lightboxEl) closeLightbox();
});

/* ================================================================
   MOBILE NAV TOGGLE
   ================================================================ */

const navToggle = document.querySelector(".nav-toggle");
const navPrimary = document.querySelector(".nav-primary");

if (navToggle && navPrimary) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", !expanded);
    navPrimary.classList.toggle("is-open");
  });

  navPrimary.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      navPrimary.classList.remove("is-open");
    });
  });

  document.addEventListener("click", (e) => {
    if (!navPrimary.contains(e.target) && !navToggle.contains(e.target)) {
      navToggle.setAttribute("aria-expanded", "false");
      navPrimary.classList.remove("is-open");
    }
  });
}

/* ================================================================
   3D NETSUKE (Three.js)
   ================================================================ */

async function initNetsuke() {
  const canvas = document.getElementById("netsuke-canvas");
  const fallback = document.querySelector(".netsuke-fallback");
  if (!canvas) return;

  try {
    const THREE = await import("three");
    const { mergeGeometries } = await import("three/addons/utils/BufferGeometryUtils.js");

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });

    const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 3.5);

    /* ── Geometry: Netsuke form ── */
    const createNetsukeGeometry = () => {
      const geometries = [];

      // Main body - organic pebble form
      const bodyGeo = new THREE.SphereGeometry(1, 64, 48);
      const positions = bodyGeo.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        const r = Math.sqrt(x*x + y*y + z*z);
        const noise = Math.sin(x * 7) * 0.04 + Math.sin(y * 5) * 0.03 + Math.sin(z * 6) * 0.02;
        const stretch = 1 + y * 0.15;
        positions.setXYZ(i, x * (1 + noise) * stretch, y * stretch * 1.1, z * (1 + noise));
      }
      bodyGeo.computeVertexNormals();
      geometries.push(bodyGeo);

      // Hole through center (himotoshi)
      const holeGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 32);
      holeGeo.rotateX(Math.PI / 2);
      geometries.push(holeGeo);

      // Seal mark on front
      const sealGeo = new THREE.CircleGeometry(0.28, 32);
      sealGeo.translate(0, 0, 1.02);
      geometries.push(sealGeo);

      // Base rim
      const rimGeo = new THREE.TorusGeometry(1.05, 0.03, 16, 64);
      rimGeo.rotateX(Math.PI / 2);
      rimGeo.translate(0, -1.1, 0);
      geometries.push(rimGeo);

      return mergeGeometries(geometries, false);
    };

    const geometry = createNetsukeGeometry();
    geometry.computeBoundingSphere();

    /* ── Materials ── */
    const paperColor = new THREE.Color(0xE9E3D4);
    const indigoColor = new THREE.Color(0x263B68);
    const vermilionColor = new THREE.Color(0xB51225);
    const bodyColor = new THREE.Color(0xC8B8A0); // warmer, slightly darker paper tone

    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: bodyColor,
      roughness: 0.75,
      metalness: 0.0,
      clearcoat: 0.25,
      clearcoatRoughness: 0.3,
      sheen: 0.4,
      sheenColor: new THREE.Color(0xE8DCC8),
    });

    const indigoMaterial = new THREE.MeshPhysicalMaterial({
      color: indigoColor,
      roughness: 0.6,
      metalness: 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
    });

    const vermilionMaterial = new THREE.MeshPhysicalMaterial({
      color: vermilionColor,
      roughness: 0.4,
      metalness: 0.0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      emissive: vermilionColor.clone().multiplyScalar(0.05),
    });

    const holeMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x1A1A18),
      roughness: 0.9,
      metalness: 0.0,
    });

    /* ── Mesh groups ── */
    const netsuke = new THREE.Group();

    const bodyMesh = new THREE.Mesh(geometry, bodyMaterial);
    netsuke.add(bodyMesh);

    // We'll use material indices for different parts
    // For simplicity, using separate geometries for seal and hole
    const sealMesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.28, 32),
      vermilionMaterial
    );
    sealMesh.position.z = 1.021;
    sealMesh.renderOrder = 1;
    netsuke.add(sealMesh);

    const holeMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 2.5, 32),
      holeMaterial
    );
    holeMesh.rotation.x = Math.PI / 2;
    netsuke.add(holeMesh);

    scene.add(netsuke);

    /* ── Lighting ── */
    const ambient = new THREE.AmbientLight(0xFFFFFF, 0.6);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xFFF8F0, 1.2);
    keyLight.position.set(2, 3, 2);
    keyLight.castShadow = false;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xE8E0D8, 0.5);
    fillLight.position.set(-1.5, 1, -1.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x263B68, 0.3);
    rimLight.position.set(0, -2, -2);
    scene.add(rimLight);

    const rimLight2 = new THREE.DirectionalLight(0xE8DCC8, 0.4);
    rimLight2.position.set(1.5, -1.5, 1.5);
    scene.add(rimLight2);

    /* ── Environment ── */
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x000000);

    const panelMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setRGB(2.5, 2.4, 2.2),
      side: THREE.DoubleSide,
      toneMapped: false
    });

    const panels = [
      { size: [0.15, 8], position: [-4.5, 0.3, 0.5], rotation: [0, Math.PI / 2, 0] },
      { size: [7, 0.2], position: [0, 4.2, 0], rotation: [Math.PI / 2, 0, 0] },
      { size: [0.6, 5], position: [1.5, 0, -4.5], rotation: [0, 0, 0] },
    ];

    panels.forEach(({ size, position, rotation }) => {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(...size), panelMat);
      panel.position.set(...position);
      panel.rotation.set(...rotation);
      envScene.add(panel);
    });

    const softPanelMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setRGB(0.2, 0.22, 0.28),
      side: THREE.DoubleSide,
      toneMapped: false
    });
    const softPanel = new THREE.Mesh(new THREE.PlaneGeometry(4, 5), softPanelMat);
    softPanel.position.set(0, 0.3, 5);
    envScene.add(softPanel);

    const envMap = pmremGenerator.fromScene(envScene, 0.02).texture;
    scene.environment = envMap;
    bodyMaterial.envMap = envMap;
    bodyMaterial.envMapIntensity = 0.8;
    indigoMaterial.envMap = envMap;
    indigoMaterial.envMapIntensity = 0.6;
    vermilionMaterial.envMap = envMap;
    vermilionMaterial.envMapIntensity = 0.4;

    envScene.traverse(obj => obj.geometry?.dispose());
    panelMat.dispose();
    softPanelMat.dispose();
    pmremGenerator.dispose();

    /* ── Animation ── */
    let targetRotationY = 0;
    let targetRotationX = 0;
    let currentRotationY = 0;
    let currentRotationX = 0;
    let mouseX = 0;
    let mouseY = 0;
    let scrollProgress = 0;

    function animate() {
      requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        // Scroll-driven rotation
        const scrollRotY = scrollProgress * Math.PI * 0.5;
        const scrollRotX = Math.sin(scrollProgress * Math.PI * 2) * 0.15;

        // Mouse parallax
        const mouseRotY = mouseX * 0.05;
        const mouseRotX = mouseY * -0.03;

        targetRotationY = scrollRotY + mouseRotY;
        targetRotationX = scrollRotX + mouseRotX;

        currentRotationY = lerp(currentRotationY, targetRotationY, 0.05);
        currentRotationX = lerp(currentRotationX, targetRotationX, 0.05);

        netsuke.rotation.y = currentRotationY;
        netsuke.rotation.x = currentRotationX;

        // Subtle float
        netsuke.position.y = Math.sin(performance.now() * 0.0008) * 0.02;
      }

      renderer.render(scene, camera);
    }

    /* ── Resize ── */
    function onResize() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    window.addEventListener("resize", onResize);

    /* ── Mouse parallax ── */
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    canvas.addEventListener("mouseleave", () => {
      mouseX = 0;
      mouseY = 0;
    });

    /* ── Scroll progress ── */
    window.addEventListener("scroll", () => {
      const hero = document.getElementById("inicio");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const vh = window.innerHeight;
        scrollProgress = clamp(-rect.top / Math.max(rect.height, vh));
      }
    }, { passive: true });

    /* ── Start ── */
    canvas.classList.add("loaded");
    if (fallback) fallback.style.opacity = "0";

    animate();

    /* Cleanup on unload */
    window.addEventListener("beforeunload", () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", arguments.callee);
      renderer.dispose();
      geometry.dispose();
      bodyMaterial.dispose();
      indigoMaterial.dispose();
      vermilionMaterial.dispose();
      holeMaterial.dispose();
      envMap.dispose();
    }, { once: true });

  } catch (err) {
    console.warn("Netsuke 3D failed to initialize:", err);
    canvas.style.display = "none";
    if (fallback) fallback.style.opacity = "1";
  }
}

/* ================================================================
   HIDDEN STUDIO / KAKUSHI KŌBŌ (隠し工房)
   Creative Director & Portfolio Management System
   ================================================================ */

const DEFAULT_STUDIO_CONFIG = {
  theme: {
    washi: "#E9E3D4",
    sumi: "#171717",
    shinsha: "#B51225",
    aizome: "#263B68",
    nigori: "#77766F"
  },
  texts: {
    heroTitle1: "Ideias com",
    heroTitle2: "presença.",
    heroCopy: "Crio produtos digitais onde código de alta performance, inteligência artificial e direção visual operam como uma coisa só. Arquiteturas sólidas com impacto estético inconfundível.",
    manifestoBody: "Não construo apenas telas funcionais. Construo ecossistemas digitais que têm voz, ritmo e uma razão visceral para existir. Da arquitetura do estado ao peso do pixel, cada decisão expressa clareza técnica e intencionalidade artística.",
    contactEmail: "joaopedro1083alves@gmail.com",
    contactLead: "Disponível para posições estratégicas de frontend, engenharia criativa, design engineering e desenvolvimento de produtos ambiciosos. Tem um projeto ou desafio à altura?"
  },
  artworks: {
    heroImg: "assets/ukiyo-e/dragon-hero.jpg",
    manifestoImg: "assets/ukiyo-e/oni-samurai.jpg",
    contactImg: "assets/ukiyo-e/tiger-botanical.jpg"
  },
  projects: [
    {
      id: "alchemist",
      layout: "featured",
      number: "01",
      category: "Projeto Principal · SaaS",
      status: "Em Evolução",
      title: "Alchemist",
      desc: "O espaço de trabalho definitivo para mestres e jogadores de RPG. Campanhas, fichas complexas de personagens, NPCs dinâmicos e cronologia de sessões orquestrados em uma interface dark-fantasy de imersão profunda.",
      tags: ["React", "TypeScript", "Tailwind CSS", "Canvas API", "State Engine", "Product Design"],
      media: [
        { type: "image", src: "assets/alchemist/landing.webp", full: "assets/alchemist/landing-full.webp", label: "Landing page do Alchemist RPG" },
        { type: "image", src: "assets/alchemist/dashboard.webp", full: "assets/alchemist/dashboard-full.webp", label: "Dashboard de campanhas do Alchemist" },
        { type: "image", src: "assets/alchemist/characters.webp", full: "assets/alchemist/characters-full.webp", label: "Gestão de fichas de personagens" }
      ],
      liveUrl: "",
      githubUrl: "",
      seal: "錬"
    },
    {
      id: "nexus",
      layout: "card",
      number: "02",
      category: "AI Developer Tool",
      status: "Disponível",
      title: "Nexus Agent",
      desc: "Agente de inteligência artificial focado em engenharia de software que substitui a mesmice dos terminais por ergonomia gráfica. Suporte a BYOK (NVIDIA, Claude, OpenAI).",
      tags: ["AI Agents", "Multi-Provider", "Dev Experience"],
      media: [
        { type: "image", src: "assets/nexus/nexus-home.webp", full: "assets/nexus/nexus-home-full.webp", label: "Interface inicial do Nexus Agent" }
      ],
      liveUrl: "https://nexus-your-ai-coder.vercel.app/",
      githubUrl: "",
      seal: "結"
    },
    {
      id: "ia-os",
      layout: "card",
      number: "03",
      category: "Sistema Operacional",
      status: "Em Design",
      title: "IA-OS",
      desc: "Sistema operacional virtual experimental projetado para sintetizar contexto pessoal, projetos e fluxos autônomos em uma camada inteligente unificada.",
      tags: ["Inteligência Artificial", "OS Concept", "Productivity"],
      media: [
        { type: "image", src: "assets/ia-os/ia-os-home.webp", full: "assets/ia-os/ia-os-home-full.webp", label: "Workspace inteligente do IA-OS" }
      ],
      liveUrl: "",
      githubUrl: "",
      seal: "道"
    },
    {
      id: "galeria",
      layout: "card",
      number: "04",
      category: "Marketplace Visual",
      status: "Em Design",
      title: "Galeria de Artistas",
      desc: "Galeria e marketplace virtual onde artistas visuais independentes publicam, expõem e comercializam tiragens físicas e digitais em um ambiente de alto valor estético.",
      tags: ["Marketplace", "Art Platform", "Web3 Ready"],
      media: [],
      liveUrl: "",
      githubUrl: "",
      seal: "作"
    }
  ]
};

const THEME_PRESETS = {
  "imperial": {
    washi: "#E9E3D4",
    sumi: "#171717",
    shinsha: "#B51225",
    aizome: "#263B68",
    nigori: "#77766F"
  },
  "sumi-dark": {
    washi: "#151619",
    sumi: "#F2EDE3",
    shinsha: "#D94A3C",
    aizome: "#3C527D",
    nigori: "#9E9D95"
  },
  "kyoto-forest": {
    washi: "#E8E4DA",
    sumi: "#14221A",
    shinsha: "#8C6D3F",
    aizome: "#1F3A2B",
    nigori: "#6A6C65"
  },
  "indigo-aizome": {
    washi: "#ECE7DC",
    sumi: "#131B2A",
    shinsha: "#C43D2D",
    aizome: "#1E335E",
    nigori: "#6A7280"
  }
};

function loadStudioConfig() {
  try {
    const raw = localStorage.getItem("alvz_studio_v2");
    if (!raw) return DEFAULT_STUDIO_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      theme: { ...DEFAULT_STUDIO_CONFIG.theme, ...(parsed.theme || {}) },
      texts: { ...DEFAULT_STUDIO_CONFIG.texts, ...(parsed.texts || {}) },
      artworks: { ...DEFAULT_STUDIO_CONFIG.artworks, ...(parsed.artworks || {}) },
      projects: Array.isArray(parsed.projects) ? parsed.projects : DEFAULT_STUDIO_CONFIG.projects
    };
  } catch (err) {
    console.warn("Falha ao carregar configuração do estúdio:", err);
    return DEFAULT_STUDIO_CONFIG;
  }
}

function saveStudioConfig(config) {
  try {
    const jsonStr = JSON.stringify(config);
    if (jsonStr.length > 4.5 * 1024 * 1024) {
      showStudioToast("⚠️ Configuração muito grande para localStorage. Reduza o número/tamanho das imagens.");
      return false;
    }
    localStorage.setItem("alvz_studio_v2", jsonStr);
    return true;
  } catch (err) {
    console.error("Falha ao salvar configuração:", err);
    if (err.name === "QuotaExceededError" || err.code === 22) {
      showStudioToast("⚠️ Armazenamento cheio. Exporte o backup e limpe dados do site, ou reduza as imagens.");
    } else {
      showStudioToast("⚠️ Erro ao salvar dados no navegador.");
    }
    return false;
  }
}

function applyThemeVariables(theme) {
  const root = document.documentElement;
  if (!theme) return;
  if (theme.washi) root.style.setProperty("--washi", theme.washi);
  if (theme.sumi) root.style.setProperty("--sumi", theme.sumi);
  if (theme.shinsha) {
    root.style.setProperty("--shinsha", theme.shinsha);
    root.style.setProperty("--shinsha-dark", theme.shinsha);
  }
  if (theme.aizome) root.style.setProperty("--aizome", theme.aizome);
  if (theme.nigori) root.style.setProperty("--nigori", theme.nigori);
}

function applyCustomTexts(texts, artworks) {
  if (texts) {
    const h1Line1 = document.querySelector(".hero-line-1");
    if (h1Line1 && texts.heroTitle1) h1Line1.textContent = texts.heroTitle1;

    const h1Line2 = document.querySelector(".hero-line-2 em");
    if (h1Line2 && texts.heroTitle2) h1Line2.textContent = texts.heroTitle2;

    const heroCopy = document.querySelector(".hero-copy");
    if (heroCopy && texts.heroCopy) heroCopy.textContent = texts.heroCopy;

    const manifestoBody = document.querySelector(".manifesto-body");
    if (manifestoBody && texts.manifestoBody) manifestoBody.textContent = texts.manifestoBody;

    const contactEmail = document.querySelector(".contact-email");
    if (contactEmail && texts.contactEmail) {
      contactEmail.href = `mailto:${texts.contactEmail}`;
      contactEmail.innerHTML = `${texts.contactEmail} <span aria-hidden="true">→</span>`;
    }

    const contactLead = document.querySelector(".contact-lead");
    if (contactLead && texts.contactLead) contactLead.textContent = texts.contactLead;
  }

  if (artworks) {
    if (artworks.heroImg) {
      const heroImg = document.querySelector(".hero-art-image-wrapper img");
      if (heroImg) heroImg.src = artworks.heroImg;
    }
    if (artworks.manifestoImg) {
      const manImg = document.querySelector(".manifesto-art-image img");
      if (manImg) manImg.src = artworks.manifestoImg;
    }
    if (artworks.contactImg) {
      const conImg = document.querySelector(".contact-art-image img");
      if (conImg) conImg.src = artworks.contactImg;
    }
  }
}

function renderPortfolioProjects(projects) {
  const container = document.getElementById("projects-container");
  if (!container || !Array.isArray(projects)) return;

  const featured = projects.filter(p => p.layout === "featured");
  const cards = projects.filter(p => p.layout !== "featured");

  let html = "";

  // Render Featured Projects
  featured.forEach(p => {
    const hasMedia = Array.isArray(p.media) && p.media.length > 0;
    let slidesHtml = "";

    if (hasMedia) {
      slidesHtml = p.media.map(m => {
        if (m.type === "video") {
          return `
            <figure class="carousel-slide">
              <div style="aspect-ratio:16/10; background:#000; display:flex; align-items:center; justify-content:center;">
                <video src="${m.src}" controls playsinline style="width:100%; height:100%; object-fit:contain;"></video>
              </div>
            </figure>`;
        }
        return `
          <figure class="carousel-slide">
            <button class="image-zoom" type="button" data-lightbox-image data-gallery="${p.title}" data-full="${m.full || m.src}" aria-label="Ampliar ${m.label || p.title}">
              <img src="${m.src}" alt="${m.label || p.title}">
            </button>
          </figure>`;
      }).join("");
    } else {
      slidesHtml = `
        <figure class="carousel-slide">
          <div style="aspect-ratio:16/10; background:var(--washi); display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); color:var(--nigori);">
            [ NENHUMA MÍDIA ANEXADA ]
          </div>
        </figure>`;
    }

    const tagsHtml = (p.tags || []).map(t => `<span>${t}</span>`).join("");

    html += `
      <article class="project-featured bracket-corner" data-project="${p.id}">
        <div class="project-visual">
          <div class="project-carousel" data-carousel aria-label="Imagens de ${p.title}">
            <div class="carousel-track">
              ${slidesHtml}
            </div>
            <div class="carousel-controls">
              <div class="carousel-dots" aria-label="Selecionar slide"></div>
              <div class="carousel-arrows">
                <button class="carousel-arrow prev" type="button" aria-label="Slide anterior">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button class="carousel-arrow next" type="button" aria-label="Próximo slide">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="project-copy">
          <div>
            <div class="project-meta">
              <span class="project-number">${p.number || "01"}</span>
              <span class="project-category">${p.category || "Projeto"}</span>
              <span class="project-status">${p.status || "Ativo"}</span>
            </div>
            <h3 class="project-title">${p.title}</h3>
            <p class="project-desc">${p.desc}</p>
            <div class="project-tags">${tagsHtml}</div>
          </div>

          <div class="project-footer-actions">
            ${p.liveUrl ? `<a class="project-link" href="${p.liveUrl}" target="_blank" rel="noreferrer">Visitar projeto <span aria-hidden="true">→</span></a>` : `<span class="project-status-inline"><span class="status-dot" aria-hidden="true"></span>${p.status || "Em desenvolvimento"}</span>`}
            ${p.githubUrl ? `<a class="project-link" href="${p.githubUrl}" target="_blank" rel="noreferrer" style="margin-left:8px;">GitHub <span aria-hidden="true">↗</span></a>` : ""}
            <span class="hanko-seal square" aria-hidden="true" style="width:28px;height:28px;font-size:0.9rem;margin-left:auto;">${p.seal || "作"}</span>
          </div>
        </div>
      </article>`;
  });

  // Render Secondary Cards Grid
  if (cards.length > 0) {
    let cardsHtml = "";
    cards.forEach(p => {
      const hasMedia = Array.isArray(p.media) && p.media.length > 0;
      let slidesHtml = "";

      if (hasMedia) {
        slidesHtml = p.media.map(m => {
          if (m.type === "video") {
            return `
              <figure class="carousel-slide">
                <div style="aspect-ratio:16/10; background:#000; display:flex; align-items:center; justify-content:center;">
                  <video src="${m.src}" controls playsinline style="width:100%; height:100%; object-fit:contain;"></video>
                </div>
              </figure>`;
          }
          return `
            <figure class="carousel-slide">
              <button class="image-zoom" type="button" data-lightbox-image data-gallery="${p.title}" data-full="${m.full || m.src}" aria-label="Ampliar ${m.label || p.title}">
                <img src="${m.src}" alt="${m.label || p.title}">
              </button>
            </figure>`;
        }).join("");
      } else {
        slidesHtml = `
          <figure class="carousel-slide">
            <div class="concept concept-nexus" style="aspect-ratio:16/10;">
              <div class="concept-top"><span>PROJETO / ${p.number || "00"}</span><span>${p.status || "ATIVO"}</span></div>
              <div style="text-align:center; margin:auto 0;">
                <strong style="color:var(--washi); font-size:1.1rem; display:block;">${p.title}</strong>
                <p style="color:var(--nigori); font-size:0.75rem; margin-top:4px;">${p.category || ""}</p>
              </div>
            </div>
          </figure>`;
      }

      const tagsHtml = (p.tags || []).map(t => `<span>${t}</span>`).join("");

      cardsHtml += `
        <article class="project-card" data-project="${p.id}">
          <div class="project-visual">
            <div class="project-carousel" data-carousel aria-label="Imagens de ${p.title}">
              <div class="carousel-track">
                ${slidesHtml}
              </div>
              <div class="carousel-controls">
                <div class="carousel-dots" aria-label="Selecionar imagem"></div>
                <div class="carousel-arrows">
                  <button class="carousel-arrow prev" type="button" aria-label="Slide anterior">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button class="carousel-arrow next" type="button" aria-label="Próximo slide">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="project-copy">
            <div class="project-meta">
              <span class="project-number">${p.number || "00"}</span>
              <span class="project-category">${p.category || "Projeto"}</span>
              <span class="project-status">${p.status || "Ativo"}</span>
            </div>
            <h3 class="project-title" style="font-size: var(--text-h3);">${p.title}</h3>
            <p class="project-desc">${p.desc}</p>
            <div class="project-tags">${tagsHtml}</div>
            <div class="project-footer-actions">
              ${p.liveUrl ? `<a class="project-link" href="${p.liveUrl}" target="_blank" rel="noreferrer">Visitar projeto <span aria-hidden="true">→</span></a>` : `<span class="project-status-inline"><span class="status-dot" aria-hidden="true"></span>${p.status || "Em breve"}</span>`}
              ${p.githubUrl ? `<a class="project-link" href="${p.githubUrl}" target="_blank" rel="noreferrer" style="margin-left:8px;">GitHub <span aria-hidden="true">↗</span></a>` : ""}
            </div>
          </div>
        </article>`;
    });

    html += `<div class="secondary-projects-grid">${cardsHtml}</div>`;
  }

  container.innerHTML = html;

  // Re-bind interactive systems
  setupAllCarousels();
  setupLightboxTriggers();
}

function showStudioToast(message) {
  const toast = document.getElementById("studio-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

function initStudio() {
  const modal = document.getElementById("alvz-studio-modal");
  const closeBtn = document.getElementById("studio-close-btn");
  const floatingTrigger = document.getElementById("studio-floating-trigger");
  const chopSeal = document.getElementById("brand-chop-seal");

  if (!modal) return;

  let currentConfig = loadStudioConfig();
  let tempMediaItems = [];

  const projectsListEl = document.getElementById("studio-projects-list");
  const projectFormEl = document.getElementById("studio-project-form");
  const btnNewProject = document.getElementById("btn-new-project");
  const btnCancelProject = document.getElementById("btn-cancel-project");
  const mediaContainerEl = document.getElementById("p-media-items-container");

  // Apply initial loaded configuration
  applyThemeVariables(currentConfig.theme);
  applyCustomTexts(currentConfig.texts, currentConfig.artworks);
  renderPortfolioProjects(currentConfig.projects);

  function openStudio() {
    modal.showModal();
    floatingTrigger?.classList.add("is-visible");
    syncStudioFormFields();
  }

  function closeStudio() {
    modal.close();
  }

  // Secret Triggers:
  // 1. Triple click on brand chop seal [印]
  let chopClicks = 0;
  let chopTimer = null;
  if (chopSeal) {
    chopSeal.addEventListener("click", (e) => {
      e.preventDefault();
      chopClicks++;
      clearTimeout(chopTimer);
      if (chopClicks >= 3) {
        chopClicks = 0;
        openStudio();
        showStudioToast("工房解錠 · Studio Alvz Aberto!");
      } else {
        chopTimer = setTimeout(() => { chopClicks = 0; }, 600);
      }
    });
  }

  // 2. Secret keyboard shortcuts: Ctrl + Shift + A, Cmd + Shift + A, or Alt + A
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
      e.preventDefault();
      if (modal.open) closeStudio();
      else {
        openStudio();
        showStudioToast("Bancada Studio Aberta [Ctrl+Shift+A]");
      }
    } else if (e.altKey && e.key.toLowerCase() === "a") {
      e.preventDefault();
      if (modal.open) closeStudio();
      else openStudio();
    }
  });

  // 3. URL Parameter (?studio or ?admin=1)
  if (window.location.search.includes("studio") || window.location.search.includes("admin")) {
    openStudio();
    showStudioToast("Studio Alvz Ativado via URL");
  }

  // Floating trigger button
  floatingTrigger?.addEventListener("click", openStudio);
  closeBtn?.addEventListener("click", closeStudio);

  // Tab switching
  const tabBtns = modal.querySelectorAll(".studio-tab-btn");
  const panels = modal.querySelectorAll(".studio-panel");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.tab;
      tabBtns.forEach(b => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      panels.forEach(p => p.classList.remove("is-active"));

      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      document.getElementById(targetId)?.classList.add("is-active");
    });
  });

  // Sync Form Fields with Active State
  function syncStudioFormFields() {
    // Sync Themes
    const t = currentConfig.theme;
    if (t) {
      setPickerValue("washi", t.washi);
      setPickerValue("sumi", t.sumi);
      setPickerValue("shinsha", t.shinsha);
      setPickerValue("aizome", t.aizome);
      setPickerValue("nigori", t.nigori);
    }

    // Sync Texts
    const txt = currentConfig.texts;
    if (txt) {
      setInputValue("txt-hero-title1", txt.heroTitle1);
      setInputValue("txt-hero-title2", txt.heroTitle2);
      setInputValue("txt-hero-copy", txt.heroCopy);
      setInputValue("txt-manifesto-body", txt.manifestoBody);
      setInputValue("txt-contact-email", txt.contactEmail);
      setInputValue("txt-contact-lead", txt.contactLead);
    }

    // Sync Artworks
    const art = currentConfig.artworks;
    if (art) {
      setInputValue("img-hero-input", art.heroImg);
      setInputValue("img-manifesto-input", art.manifestoImg);
      setInputValue("img-contact-input", art.contactImg);
    }

    // Render Projects Manager List
    renderStudioProjectsList();

    // Update JSON Preview
    const previewEl = document.getElementById("studio-json-preview");
    if (previewEl) {
      previewEl.value = JSON.stringify(currentConfig, null, 2);
    }
  }

  function setPickerValue(name, val) {
    if (!val) return;
    const colorInput = document.getElementById(`color-${name}`);
    const hexInput = document.getElementById(`hex-${name}`);
    if (colorInput) colorInput.value = val;
    if (hexInput) hexInput.value = val;
  }

  function setInputValue(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  }

  // ── Color Theme Handling ──
  ["washi", "sumi", "shinsha", "aizome", "nigori"].forEach(name => {
    const colorInput = document.getElementById(`color-${name}`);
    const hexInput = document.getElementById(`hex-${name}`);

    colorInput?.addEventListener("input", (e) => {
      if (hexInput) hexInput.value = e.target.value.toUpperCase();
      applyThemeVariables(getThemeFromInputs());
    });

    hexInput?.addEventListener("change", (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith("#")) val = "#" + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        if (colorInput) colorInput.value = val;
        applyThemeVariables(getThemeFromInputs());
      }
    });
  });

  function getThemeFromInputs() {
    return {
      washi: document.getElementById("hex-washi")?.value || currentConfig.theme.washi,
      sumi: document.getElementById("hex-sumi")?.value || currentConfig.theme.sumi,
      shinsha: document.getElementById("hex-shinsha")?.value || currentConfig.theme.shinsha,
      aizome: document.getElementById("hex-aizome")?.value || currentConfig.theme.aizome,
      nigori: document.getElementById("hex-nigori")?.value || currentConfig.theme.nigori,
    };
  }

  // Theme Presets
  document.querySelectorAll(".preset-card").forEach(card => {
    card.addEventListener("click", () => {
      const presetKey = card.dataset.preset;
      const preset = THEME_PRESETS[presetKey];
      if (preset) {
        currentConfig.theme = { ...preset };
        applyThemeVariables(currentConfig.theme);
        syncStudioFormFields();
        const saved = saveStudioConfig(currentConfig);
        if (saved !== false) showStudioToast(`Tema "${card.querySelector(".preset-title")?.textContent}" aplicado!`);
      }
    });
  });

  document.getElementById("btn-apply-theme")?.addEventListener("click", () => {
    currentConfig.theme = getThemeFromInputs();
    applyThemeVariables(currentConfig.theme);
    const saved = saveStudioConfig(currentConfig);
    if (saved !== false) showStudioToast("✓ Paleta de cores salva com sucesso!");
  });

  document.getElementById("btn-reset-theme")?.addEventListener("click", () => {
    currentConfig.theme = { ...DEFAULT_STUDIO_CONFIG.theme };
    applyThemeVariables(currentConfig.theme);
    syncStudioFormFields();
    const saved = saveStudioConfig(currentConfig);
    if (saved !== false) showStudioToast("Cores restauradas para o padrão Imperial Ukiyo-e");
  });

  // ── Texts & Artworks Handling ──
  document.getElementById("btn-apply-texts")?.addEventListener("click", () => {
    currentConfig.texts = {
      heroTitle1: document.getElementById("txt-hero-title1")?.value || "",
      heroTitle2: document.getElementById("txt-hero-title2")?.value || "",
      heroCopy: document.getElementById("txt-hero-copy")?.value || "",
      manifestoBody: document.getElementById("txt-manifesto-body")?.value || "",
      contactEmail: document.getElementById("txt-contact-email")?.value || "",
      contactLead: document.getElementById("txt-contact-lead")?.value || "",
    };

    currentConfig.artworks = {
      heroImg: document.getElementById("img-hero-input")?.value || "",
      manifestoImg: document.getElementById("img-manifesto-input")?.value || "",
      contactImg: document.getElementById("img-contact-input")?.value || "",
    };

    applyCustomTexts(currentConfig.texts, currentConfig.artworks);
    const saved = saveStudioConfig(currentConfig);
    if (saved !== false) showStudioToast("✓ Textos e ilustrações atualizados no portfólio!");
  });

  document.getElementById("btn-reset-texts")?.addEventListener("click", () => {
    currentConfig.texts = { ...DEFAULT_STUDIO_CONFIG.texts };
    currentConfig.artworks = { ...DEFAULT_STUDIO_CONFIG.artworks };
    applyCustomTexts(currentConfig.texts, currentConfig.artworks);
    syncStudioFormFields();
    const saved = saveStudioConfig(currentConfig);
    if (saved !== false) showStudioToast("Textos originais restaurados.");
  });

  function compressImage(file, maxWidth = 1200, maxHeight = 900, quality = 0.75) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL("image/webp", quality);
          resolve(dataUrl);
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Local File Uploads for Section Artworks
  function bindArtworkFileUploader(inputId, textTargetId, artworkKey) {
    const fileInput = document.getElementById(inputId);
    fileInput?.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        showStudioToast("Processando imagem...");
        const dataUrl = await compressImage(file);
        
        if (dataUrl.length > 4 * 1024 * 1024) {
          showStudioToast("⚠️ Imagem muito grande mesmo após compressão. Tente uma resolução menor.");
          return;
        }
        
        currentConfig.artworks[artworkKey] = dataUrl;
        const textTarget = document.getElementById(textTargetId);
        if (textTarget) textTarget.value = "[Foto Customizada Carregada]";
        applyCustomTexts(currentConfig.texts, currentConfig.artworks);
        
        const saved = saveStudioConfig(currentConfig);
        if (saved !== false) {
          showStudioToast("✓ Nova ilustração carregada e salva!");
        }
      } catch (err) {
        console.error("Erro ao processar imagem:", err);
        showStudioToast("⚠️ Erro ao processar a imagem.");
      }
    });
  }

  bindArtworkFileUploader("file-hero-img", "img-hero-input", "heroImg");
  bindArtworkFileUploader("file-manifesto-img", "img-manifesto-input", "manifestoImg");
  bindArtworkFileUploader("file-contact-img", "img-contact-input", "contactImg");

  // ── Projects Manager UI ──

  function renderStudioProjectsList() {
    if (!projectsListEl) return;
    projectsListEl.innerHTML = "";

    currentConfig.projects.forEach(p => {
      const firstMedia = p.media?.[0]?.src || "assets/ukiyo-e/dragon-hero.jpg";
      const row = document.createElement("div");
      row.className = "studio-project-row";
      row.innerHTML = `
        <div class="studio-project-info">
          <img class="studio-project-thumb" src="${firstMedia}" alt="${p.title}">
          <div class="studio-project-meta">
            <strong>${p.title} <small style="font-family:var(--font-mono); font-size:0.75rem; color:var(--shinsha);">[${p.layout === "featured" ? "Destaque" : "Card"}]</small></strong>
            <span>${p.number || "00"} · ${p.category || "Projeto"} · ${p.status || "Ativo"}</span>
          </div>
        </div>
        <div class="studio-project-actions">
          <button class="studio-btn studio-btn-secondary studio-btn-sm btn-edit-p" data-id="${p.id}" type="button">Editar</button>
          <button class="studio-btn studio-btn-danger studio-btn-sm btn-del-p" data-id="${p.id}" type="button">Excluir</button>
        </div>`;
      projectsListEl.appendChild(row);
    });

    // Bind Edit and Delete Buttons
    projectsListEl.querySelectorAll(".btn-edit-p").forEach(btn => {
      btn.addEventListener("click", () => editProject(btn.dataset.id));
    });

    projectsListEl.querySelectorAll(".btn-del-p").forEach(btn => {
      btn.addEventListener("click", () => deleteProject(btn.dataset.id));
    });
  }

  function renderMediaPreviews() {
    if (!mediaContainerEl) return;
    mediaContainerEl.innerHTML = "";

    tempMediaItems.forEach((m, idx) => {
      const card = document.createElement("div");
      card.className = "media-item-card";

      if (m.type === "video") {
        card.innerHTML = `
          <video src="${m.src}" muted playsinline></video>
          <span class="media-item-badge">Vídeo</span>
          <button class="media-item-remove" type="button" data-idx="${idx}">✕</button>`;
      } else {
        card.innerHTML = `
          <img src="${m.src}" alt="Mídia ${idx + 1}">
          <span class="media-item-badge">Foto</span>
          <button class="media-item-remove" type="button" data-idx="${idx}">✕</button>`;
      }

      card.querySelector(".media-item-remove").addEventListener("click", () => {
        tempMediaItems.splice(idx, 1);
        renderMediaPreviews();
      });

      mediaContainerEl.appendChild(card);
    });
  }

  // Add Media by URL
  document.getElementById("btn-add-media-url")?.addEventListener("click", () => {
    const input = document.getElementById("p-media-url-input");
    const url = input?.value.trim();
    if (!url) return;

    const isVideo = url.endsWith(".mp4") || url.endsWith(".webm") || url.includes("youtube.com") || url.includes("vimeo.com");
    tempMediaItems.push({
      type: isVideo ? "video" : "image",
      src: url,
      full: url,
      label: "Mídia anexada"
    });

    if (input) input.value = "";
    renderMediaPreviews();
  });

  // Upload Local Photos / Videos
  document.getElementById("p-media-file-input")?.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      if (isVideo) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          tempMediaItems.push({
            type: "video",
            src: evt.target.result,
            full: evt.target.result,
            label: file.name
          });
          renderMediaPreviews();
        };
        reader.readAsDataURL(file);
      } else {
        try {
          showStudioToast("Processando imagem...");
          const dataUrl = await compressImage(file, 1200, 900, 0.75);
          
          if (dataUrl.length > 3 * 1024 * 1024) {
            showStudioToast("⚠️ Imagem muito grande. Tente uma resolução menor.");
            continue;
          }
          
          tempMediaItems.push({
            type: "image",
            src: dataUrl,
            full: dataUrl,
            label: file.name
          });
          renderMediaPreviews();
          showStudioToast("✓ Imagem adicionada ao projeto!");
        } catch (err) {
          console.error("Erro ao processar imagem do projeto:", err);
          showStudioToast("⚠️ Erro ao processar a imagem.");
        }
      }
    }
  });

  // Open Form to Create New Project
  btnNewProject?.addEventListener("click", () => {
    projectFormEl.style.display = "block";
    document.getElementById("project-form-mode-title").textContent = "Criar Nova Obra / Projeto";
    document.getElementById("project-edit-id").value = "";
    document.getElementById("p-title").value = "";
    document.getElementById("p-number").value = String(currentConfig.projects.length + 1).padStart(2, "0");
    document.getElementById("p-status").value = "Disponível";
    document.getElementById("p-category").value = "Novo Projeto";
    document.getElementById("p-layout").value = "card";
    document.getElementById("p-desc").value = "";
    document.getElementById("p-tags").value = "React, TypeScript, UI/UX";
    document.getElementById("p-live-link").value = "";
    document.getElementById("p-github-link").value = "";
    tempMediaItems = [];
    renderMediaPreviews();
    projectFormEl.scrollIntoView({ behavior: "smooth" });
  });

  btnCancelProject?.addEventListener("click", () => {
    projectFormEl.style.display = "none";
  });

  function editProject(id) {
    const proj = currentConfig.projects.find(p => p.id === id);
    if (!proj) return;

    projectFormEl.style.display = "block";
    document.getElementById("project-form-mode-title").textContent = `Editar Obra: ${proj.title}`;
    document.getElementById("project-edit-id").value = proj.id;
    document.getElementById("p-title").value = proj.title || "";
    document.getElementById("p-number").value = proj.number || "";
    document.getElementById("p-status").value = proj.status || "";
    document.getElementById("p-category").value = proj.category || "";
    document.getElementById("p-layout").value = proj.layout || "card";
    document.getElementById("p-desc").value = proj.desc || "";
    document.getElementById("p-tags").value = (proj.tags || []).join(", ");
    document.getElementById("p-live-link").value = proj.liveUrl || "";
    document.getElementById("p-github-link").value = proj.githubUrl || "";

    tempMediaItems = Array.isArray(proj.media) ? [...proj.media] : [];
    renderMediaPreviews();
    projectFormEl.scrollIntoView({ behavior: "smooth" });
  }

  function deleteProject(id) {
    if (!confirm("Tem certeza que deseja excluir esta obra do portfólio?")) return;
    currentConfig.projects = currentConfig.projects.filter(p => p.id !== id);
    const saved = saveStudioConfig(currentConfig);
    if (saved !== false) {
      renderPortfolioProjects(currentConfig.projects);
      renderStudioProjectsList();
      showStudioToast("Obra excluída.");
    }
  }

  // Save Project Form
  projectFormEl?.addEventListener("submit", (e) => {
    e.preventDefault();
    const editId = document.getElementById("project-edit-id")?.value;
    const title = document.getElementById("p-title")?.value.trim();
    if (!title) return;

    const tagsRaw = document.getElementById("p-tags")?.value || "";
    const tags = tagsRaw.split(",").map(t => t.trim()).filter(Boolean);

    const projectData = {
      id: editId || ("project-" + Date.now()),
      title: title,
      number: document.getElementById("p-number")?.value.trim() || "01",
      category: document.getElementById("p-category")?.value.trim() || "Projeto",
      status: document.getElementById("p-status")?.value.trim() || "Ativo",
      layout: document.getElementById("p-layout")?.value || "card",
      desc: document.getElementById("p-desc")?.value.trim() || "",
      tags: tags,
      liveUrl: document.getElementById("p-live-link")?.value.trim() || "",
      githubUrl: document.getElementById("p-github-link")?.value.trim() || "",
      media: [...tempMediaItems],
      seal: "作"
    };

    if (editId) {
      const idx = currentConfig.projects.findIndex(p => p.id === editId);
      if (idx !== -1) currentConfig.projects[idx] = projectData;
    } else {
      currentConfig.projects.push(projectData);
    }

    const saved = saveStudioConfig(currentConfig);
    if (saved !== false) {
      renderPortfolioProjects(currentConfig.projects);
      renderStudioProjectsList();
      projectFormEl.style.display = "none";
      showStudioToast(`✓ Obra "${title}" salva com sucesso!`);
    }
  });

  // ── Backup & Export Handling ──
  document.getElementById("btn-export-json")?.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentConfig, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `alvz-portfolio-config-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showStudioToast("✓ Backup exportado com sucesso!");
  });

  document.getElementById("file-import-json")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        currentConfig = {
          theme: { ...DEFAULT_STUDIO_CONFIG.theme, ...(imported.theme || {}) },
          texts: { ...DEFAULT_STUDIO_CONFIG.texts, ...(imported.texts || {}) },
          artworks: { ...DEFAULT_STUDIO_CONFIG.artworks, ...(imported.artworks || {}) },
          projects: Array.isArray(imported.projects) ? imported.projects : DEFAULT_STUDIO_CONFIG.projects
        };
        applyThemeVariables(currentConfig.theme);
        applyCustomTexts(currentConfig.texts, currentConfig.artworks);
        renderPortfolioProjects(currentConfig.projects);
        syncStudioFormFields();
        const saved = saveStudioConfig(currentConfig);
        if (saved !== false) showStudioToast("✓ Configuração importada e aplicada com sucesso!");
      } catch (err) {
        alert("Erro ao processar o arquivo JSON. Verifique a formatação.");
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("btn-copy-code")?.addEventListener("click", () => {
    const str = JSON.stringify(currentConfig, null, 2);
    navigator.clipboard.writeText(str).then(() => {
      showStudioToast("✓ JSON copiado para a área de transferência!");
    }).catch(() => {
      const previewEl = document.getElementById("studio-json-preview");
      previewEl?.select();
      document.execCommand("copy");
      showStudioToast("✓ JSON copiado!");
    });
  });

  document.getElementById("btn-factory-reset")?.addEventListener("click", () => {
    if (!confirm("Tem certeza que deseja restaurar as configurações originais? Todas as customizações locais serão resetadas.")) return;
    localStorage.removeItem("alvz_studio_v2");
    currentConfig = { ...DEFAULT_STUDIO_CONFIG };
    applyThemeVariables(currentConfig.theme);
    applyCustomTexts(currentConfig.texts, currentConfig.artworks);
    renderPortfolioProjects(currentConfig.projects);
    syncStudioFormFields();
    const saved = saveStudioConfig(currentConfig);
    if (saved !== false) showStudioToast("Padrões de fábrica restaurados.");
  });
}

/* ================================================================
   INITIALIZATION
   ================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  setupAllCarousels();
  initNetsuke();
  initStudio();
});

/* ================================================================
   PERFORMANCE: Cleanup on pagehide
   ================================================================ */

window.addEventListener("pagehide", () => {
  activeCarousels.forEach(c => c.stopAutoplay());
  document.removeEventListener("keydown", handleLightboxKeydown);
});