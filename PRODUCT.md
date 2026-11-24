# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: mixed audience — recruiters/hiring managers evaluating for contracts, potential clients seeking dev/design services, and dev/design peers seeking inspiration and reference. Visit context varies: hiring evaluation, project scoping, networking, creative inspiration.

## Product Purpose

A personal portfolio that demonstrates the integration of engineering, AI, and visual direction as a unified craft. Success means visitors immediately perceive the distinctive point of view — that code, intelligence, and aesthetics are inseparable in the work — and remember the experience after leaving.

## Positioning

Immersive, artistically directed interfaces where the portfolio itself is the proof of craft. Unlike conventional developer portfolios that list projects in cards, this portfolio *is* a project: a carefully art-directed Japanese editorial design experience that demonstrates technical competence through its own execution.

## Operating Context

Visitors arrive via direct link, GitHub profile, LinkedIn, or referral. No authentication, no user accounts, no personalized flows. Single-session consumption. Primary consumption devices: desktop (primary evaluation), mobile (quick scan), tablet (intermediate). No offline requirement.

## Capabilities and Constraints

**Preserved capabilities (must remain functional):**
- Three.js/WebGL interactive 3D crown object with custom environment mapping
- Scroll-driven narrative: parallax, staggered line reveals, section pinning via IntersectionObserver
- Project carousels with keyboard/touch navigation, autoplay pause on hover/focus/visibility
- Full-screen image lightbox with gallery navigation, keyboard support, focus trap
- Reduced-motion respect via `prefers-reduced-motion` media query
- Passive scroll listeners, single rAF frame budget per scroll event
- Semantic HTML, skip links, focus-visible outlines, ARIA labels on icon-only controls

**Technical constraints:**
- Vanilla HTML/CSS/JS (no framework, no build step)
- ES modules via importmap (Three.js from CDN)
- CSS custom properties for theming/tokens
- No Node.js runtime required for viewing
- Assets: WebP screenshots for 4 projects (Alchemist, Nexus Agent, IA-OS, Galeria de Artistas)

**Explicitly undecided:**
- Whether the 3D crown remains the hero centerpiece or is replaced by Japanese editorial illustration
- Whether scroll animations migrate to GSAP/ScrollTrigger or stay vanilla

## Brand Commitments

**Name:** `alvz/dev` (lowercase, slash separator)
**Tagline:** "Ideias com presença." (hero headline)
**Voice:** Technical precision meets artistic direction — precise terminology, editorial rhythm, no marketing fluff.
**Visual:** Complete freedom for new visual world. No legacy visual constraints. The redesign replaces the dark-chrome aesthetic with Japanese editorial design (ukiyo-e/irezumi influences, vermilion/indigo/cream palette, experimental typography, vintage print textures).

## Evidence on Hand

- 4 project case studies with WebP screenshots (landing, dashboard, detail views)
- Project metadata: stack, status, descriptions, live/GitHub links where applicable
- Existing copy in Portuguese (hero, manifesto, project descriptions, contact)
- No testimonials, metrics, press, or case study deep-dives — future work must not fabricate these

## Product Principles

1. **Craft as argument** — The portfolio proves its thesis by being the thesis. Every interaction demonstrates the integration of engineering and art direction.
2. **Respect the visitor's attention** — No fake loading, no hijacked scroll, no decorative motion. Animation serves narrative and orientation.
3. **Accessible by default** — Reduced motion, keyboard navigation, semantic structure, contrast are non-negotiable floors, not enhancements.
4. **Performance is aesthetic** — 60fps on mid-range mobile is a creative constraint that shapes the work, not a technical afterthought.
5. **Cultural specificity over generic "Asian aesthetic"** — References are specific (ukiyo-e composition, irezumi line work, editorial typography), not decorative pastiche. No meaningless kanji.

## Accessibility & Inclusion

- WCAG 2.1 AA target for color contrast (4.5:1 text, 3:1 UI)
- Full keyboard operability (tab order = visual order, focus visible, focus trap in lightbox)
- `prefers-reduced-motion` honored: scrubbed parallax and staggered reveals replaced with instant states
- `prefers-contrast` considered for high-contrast mode
- Screen reader friendly: ARIA labels on icon controls, alt text on meaningful images, decorative 3D canvas hidden
- No vestibular triggers (no rapid zoom, no flashing, no excessive parallax)