# Design

<!-- impeccable:design-schema 1 -->

## Visual World

**Name:** Japanese Editorial Portfolio — *Ukiyo-e meets Brutalist Web*

**Concept:** The portfolio is a contemporary Japanese broadsheet — a digital *ukiyo-e* print series where each section is a composed woodblock: deliberate ink, textured paper, vermilion seals, indigo shadows. The visitor doesn't browse cards; they turn spreads. The 3D crown becomes a *netsuke* — a carved toggle object that lives in the gutter between sections, reacting to scroll like a physical object shifting in hand.

**Cultural Home:** Japanese editorial graphic design (Idea magazine, Tadanori Yokoo, Kohei Sugiura), ukiyo-e composition (asymmetric balance, cropped forms, flat color planes), irezumi line work (bold outlines, layered motifs, negative space as breath), neo-brutalist poster grids (raw structure, visible baseline, type as image).

**Mode:** Experience — the work leads from the first viewport. The interface recedes; the artifact remains.

---

## Palette

| Token | Value | Role |
|-------|-------|------|
| `--paper` | `#E9E3D4` | Aged washi ground — default background |
| `--ink` | `#171717` | Sumi black — primary text, key lines |
| `--vermilion` | `#B51225` | Red seal — primary accent, CTAs, active states |
| `--indigo` | `#263B68` | Aizome indigo — secondary depth, hover shadows, alternate backgrounds |
| `--muted` | `#77766F` | Weathered gray — secondary text, disabled, hairlines |
| `--paper-dark` | `#1A1A18` | Dark mode paper — charcoal washi |
| `--ink-dark` | `#F2EDE3` | Dark mode ink — warm off-white |
| `--vermilion-dark` | `#D94A3C` | Dark mode seal — brighter vermilion |
| `--indigo-dark` | `#4A6FA5` | Dark mode indigo — lifted for contrast |
| `--muted-dark` | `#9A9992` | Dark mode muted — warmer gray |

**Usage Rules:**
- Vermilion is strategic — never decorative. One primary action per viewport.
- Indigo carries depth — section alternates, hover elevations, scroll-progress bars.
- Paper texture is the ground — all surfaces derive from it via opacity, not new colors.
- High contrast mode: swap paper→ink, ink→paper, vermilion→#FF3B2E, indigo→#6B9EFF.

---

## Typography

### Font Stack

```css
/* Display / Editorial Headlines */
--font-display: "Noto Serif JP", "Playfair Display", Georgia, serif;
/* UI / Body / Code */
--font-ui: "Noto Sans JP", "Inter", system-ui, sans-serif;
/* Mono / Labels / Technical */
--font-mono: "JetBrains Mono", "DM Mono", monospace;
```

**Google Fonts Import:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Serif+JP:wght@400;500;600;700;900&family=Playfair+Display:ital,wght@0,400;0,600;0,900;1,400;1,600&display=swap" rel="stylesheet">
```

### Type Scale

| Role | Size (clamp) | Weight | Leading | Tracking | Font |
|------|--------------|--------|---------|----------|------|
| Hero Statement | `clamp(3.5rem, 12vw, 10rem)` | 900 | 0.95 | -0.04em | Display |
| Section Headline | `clamp(2rem, 6vw, 4rem)` | 700 | 1.05 | -0.02em | Display |
| Sub-headline | `clamp(1.25rem, 3vw, 2rem)` | 500 | 1.2 | 0 | Display (italic) |
| Body Large | `clamp(1.125rem, 2vw, 1.25rem)` | 400 | 1.7 | 0 | UI |
| Body | `1rem` | 400 | 1.75 | 0 | UI |
| Label / Meta | `0.75rem` | 500 | 1.5 | 0.08em | Mono |
| Caption / Code | `0.8125rem` | 400 | 1.6 | 0 | Mono |

### Editorial Rules

- **No kickers/eyebrows above headlines** — the headline carries its own weight (craft-floor ban).
- **Measure:** 65–75ch for body, 40–55ch for display lines.
- **Balance:** `text-wrap: balance` on headlines; `text-wrap: pretty` on body.
- **Hierarchy via weight/scale/space** — not color alone.
- **Vertical rhythm:** Space above headline > space below. 1.5× base unit above, 0.5× below.
- **Japanese punctuation** for Portuguese copy: `、` `。` `「` `」` where rhythm demands.

---

## Materials & Textures

### Paper Grain (CSS)

```css
--paper-grain: url("data:image/svg+xml,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
--paper-opacity: 0.035;  /* subtle, never dominant */
```

### Ink Bleed (for interactive elements)

```css
--ink-bleed: 0.5px;  /* subtle feather on hover/active */
```

### Seal Texture (vermilion accents)

```css
--seal-grain: url("data:image/svg+xml,<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><filter id='s'><feTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2'/></filter><circle cx='50' cy='50' r='48' filter='url(%23s)' fill='%23B51225'/></svg>");
```

---

## Layout & Composition

### Grid System

**Desktop (≥1024px):** Asymmetric 12-column editorial grid
- Columns 1–4: Navigation/Sidebar zone
- Columns 5–12: Content flow
- Gutter: `clamp(1.5rem, 3vw, 3rem)`
- Baseline grid: 8px (all spacing multiples of 8)

**Tablet (768–1023px):** 8-column, content columns 3–8
**Mobile (<768px):** 4-column, full-width content, asymmetric margins (left tighter, right generous)

### Section Rhythm

```css
--space-section: clamp(5rem, 12vh, 8rem);  /* between major sections */
--space-block: clamp(2rem, 5vh, 3.5rem);   /* between blocks within section */
--space-element: clamp(1rem, 2vh, 1.5rem); /* between related elements */
```

### Asymmetric Principles

- Content never centered by default — left-aligned with intentional right-ragged edge
- Hero: headline left, illustration right (or vice versa, alternating per section)
- Images break grid — bleed to viewport edge on one side
- Negative space is active composition, not empty background

---

## Motion & Interaction

### Motion Tokens

```css
--duration-instant: 0ms;
--duration-fast: 120ms;
--duration-base: 280ms;
--duration-slow: 480ms;
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-sharp: cubic-bezier(0.8, 0, 0.2, 1);
```

### Scroll Narrative (Experience Mode)

| Section | Scroll Behavior | Reduced Motion |
|---------|----------------|----------------|
| Hero | Netsuke (crown) parallax: translateY ±40px, rotate ±3°; headline fade/scale | Static final state, no parallax |
| About | Staggered line reveal (0.08s stagger), paper texture opacity sweep | Instant reveal, all lines visible |
| Projects | Horizontal scroll-snap carousel per project; project cards stagger on scroll enter | No stagger, snap only |
| Skills | Indigo progress bars fill on scroll enter; tags animate in columns | Instant fill, all visible |
| Contact | Seal stamp animation on final approach | Instant stamp |

### Interaction States

| Element | Hover | Active/Focus | Disabled |
|---------|-------|--------------|----------|
| Links (text) | `text-decoration: underline; text-underline-offset: 4px; color: var(--vermilion)` | `outline: 2px solid var(--vermilion); outline-offset: 4px` | `opacity: 0.4; color: var(--muted)` |
| Buttons (vermilion) | `transform: translateY(-1px); box-shadow: 0 4px 0 var(--indigo)` | `transform: translateY(1px); box-shadow: 0 1px 0 var(--indigo)` | `opacity: 0.5; cursor: not-allowed` |
| Buttons (ghost) | `background: var(--ink); color: var(--paper); border-color: var(--ink)` | `background: var(--indigo)` | `opacity: 0.4` |
| Project Cards | `transform: translateY(-4px); box-shadow: 0 12px 0 -4px var(--vermilion)` | `transform: translateY(0)` | N/A |
| Carousel Arrows | `background: var(--vermilion); color: var(--paper)` | `scale: 0.95` | `opacity: 0.3` |
| Lightbox | N/A | `focus-trap; ESC closes` | N/A |

### 3D Crown / Netsuke

- **Canvas:** Three.js, same architecture as current, but restyled
- **Material:** Matte ceramic/wood — not chrome. Indigo glaze with vermilion seal mark.
- **Scroll Reaction:** Continuous subtle rotation (Y: ±15°, X: ±5°), slight lift on section transitions
- **Mouse Parallax:** ±3° tilt (reduced motion: off)
- **Fallback:** SVG netsuke illustration with CSS transform

---

## Components

### Navigation (Header)

```html
<header class="site-header" role="banner">
  <a class="brand" href="#inicio" aria-label="alvz/dev — início">
    <span class="brand-mark">alvz</span><span class="brand-separator">/</span><span class="brand-type">dev</span>
  </a>
  <nav class="nav-primary" aria-label="Navegação principal">
    <a href="#sobre">Sobre</a>
    <a href="#projetos">Projetos</a>
    <a href="#habilidades">Habilidades</a>
    <a href="#contato">Contato</a>
  </nav>
  <a class="nav-cta" href="#contato">Disponível <span aria-hidden="true">→</span></a>
</header>
```

- Fixed, backdrop-blur on scroll, paper-texture background at 80% opacity
- Brand: Display font, vermilion seal on "dev" slash
- Nav: Mono font, uppercase, tracking-wide, ink color
- CTA: Vermilion seal button

### Hero

```html
<section class="hero" id="inicio" aria-labelledby="hero-title">
  <div class="hero-paper" aria-hidden="true"></div>
  <div class="hero-composition">
    <div class="hero-text">
      <h1 id="hero-title" class="hero-headline">
        <span class="hero-line-1">Ideias com</span>
        <span class="hero-line-2"><em>presença.</em></span>
      </h1>
      <p class="hero-copy">Crio produtos digitais onde código, inteligência e direção visual trabalham como uma coisa só.</p>
      <div class="hero-actions">
        <a class="btn btn-seal" href="#projetos">Ver projetos</a>
        <a class="btn btn-ghost" href="#contato">Conversar</a>
      </div>
    </div>
    <div class="hero-netsuke" role="img" aria-label="Netsuke esculpido — objeto de transição entre seções">
      <canvas id="netsuke-canvas" aria-hidden="true"></canvas>
      <div class="netsuke-fallback" aria-hidden="true"><svg>...</svg></div>
    </div>
  </div>
  <div class="scroll-indicator" aria-hidden="true">
    <span>Role para entrar</span>
    <svg class="scroll-arrow" viewBox="0 0 24 24"><path d="M12 4v16M8 12l4 4 4-4"/></svg>
  </div>
</section>
```

- Full viewport height (100svh)
- Asymmetric: text left (60%), netsuke right (40%)
- Paper texture layer at 3% opacity, animated grain on load
- Headline: Noto Serif JP 900, clamp(4rem, 12vw, 10rem), vermilion on "presença"
- Scroll indicator: subtle bounce animation, hides after first scroll

### About / Manifesto

```html
<section class="manifesto" id="sobre" aria-labelledby="manifesto-title">
  <div class="manifesto-paper" aria-hidden="true"></div>
  <div class="manifesto-composition">
    <div class="manifesto-code" aria-hidden="true">01 / 关于</div>
    <h2 id="manifesto-title" class="manifesto-headline">Código é matéria.<br>Intenção é forma.<br><span class="accent">Experiência é presença.</span></h2>
    <p class="manifesto-body">Não construo apenas telas. Construo sistemas que têm voz, ritmo e uma razão para existir.</p>
    <div class="manifesto-seal" aria-hidden="true"><svg class="seal-stamp">...</svg></div>
  </div>
</section>
```

- Sticky headline composition (left), scrolling body (right)
- Lines reveal on scroll with 0.08s stagger
- Red seal stamp appears on final line ("presença") at 80% progress
- Paper texture sweeps vertically as background reveal

### Projects

```html
<section class="projects" id="projetos" aria-labelledby="projects-title">
  <div class="section-header">
    <span class="section-code" aria-hidden="true">02 / 作品</span>
    <h2 id="projects-title" class="section-headline">Quatro projetos.<br><span>Uma assinatura.</span></h2>
    <p class="section-lead">Produtos autorais criados para resolver problemas reais — com personalidade, precisão técnica e atenção obsessiva aos detalhes.</p>
  </div>
  <div class="projects-grid">
    <article class="project-card project-featured" data-project="alchemist">
      <div class="project-visual">
        <div class="project-carousel" data-carousel>...</div>
      </div>
      <div class="project-meta">
        <span class="project-number">01</span>
        <span class="project-category">Projeto principal</span>
        <span class="project-status">Em evolução</span>
      </div>
      <h3 class="project-title">Alchemist</h3>
      <p class="project-desc">O espaço de trabalho definitivo para mestres e jogadores de RPG...</p>
      <div class="project-tags"><span>React</span><span>TypeScript</span><span>SaaS</span><span>Product Design</span></div>
      <a class="project-link" href="..." target="_blank">Ver projeto <span aria-hidden="true">→</span></a>
    </article>
    <!-- 3 more projects -->
  </div>
</section>
```

- Featured project: 2/3 width, horizontal carousel
- Other projects: 1/3 width, vertical stack, hover reveals
- Carousel: same architecture, new styling (paper frames, vermilion dots)
- Images: WebP, lazy, aspect-ratio preserved, lightbox on click
- Hover: card lifts, vermilion shadow bar appears at bottom

### Skills

```html
<section class="skills" id="habilidades" aria-labelledby="skills-title">
  <div class="section-header">
    <span class="section-code" aria-hidden="true">03 / 技</span>
    <h2 id="skills-title" class="section-headline">Ferramentas.<br><span>Linguagens.</span></h2>
  </div>
  <div class="skills-composition">
    <div class="skills-column">
      <h3 class="skills-category">Frontend & UI</h3>
      <div class="skills-tags">
        <span class="skill-tag" data-level="expert">React</span>
        <span class="skill-tag" data-level="expert">TypeScript</span>
        <span class="skill-tag" data-level="advanced">Three.js</span>
        <span class="skill-tag" data-level="advanced">GSAP</span>
        <span class="skill-tag" data-level="advanced">Tailwind</span>
        <span class="skill-tag" data-level="expert">CSS Moderno</span>
        <span class="skill-tag" data-level="intermediate">WebGL</span>
      </div>
    </div>
    <div class="skills-column">
      <h3 class="skills-category">AI & Backend</h3>
      <div class="skills-tags">
        <span class="skill-tag" data-level="advanced">LLM Integration</span>
        <span class="skill-tag" data-level="advanced">RAG Systems</span>
        <span class="skill-tag" data-level="intermediate">Node.js</span>
        <span class="skill-tag" data-level="intermediate">Python</span>
        <span class="skill-tag" data-level="intermediate">API Design</span>
      </div>
    </div>
    <div class="skills-column">
      <h3 class="skills-category">Design & Process</h3>
      <div class="skills-tags">
        <span class="skill-tag" data-level="expert">Product Design</span>
        <span class="skill-tag" data-level="advanced">Design Systems</span>
        <span class="skill-tag" data-level="advanced">Motion Design</span>
        <span class="skill-tag" data-level="expert">Prototyping</span>
        <span class="skill-tag" data-level="advanced">Accessibility</span>
        <span class="skill-tag" data-level="intermediate">Illustration</span>
      </div>
    </div>
  </div>
</section>
```

- Three asymmetric columns, indigo left borders
- Tags: paper background, ink text, hover→vermilion background + ink text
- Level indicator: subtle indigo dot (expert=3, advanced=2, intermediate=1)
- No progress bars — tags are the composition

### Contact

```html
<section class="contact" id="contato" aria-labelledby="contact-title">
  <div class="contact-paper" aria-hidden="true"></div>
  <div class="contact-composition">
    <span class="section-code" aria-hidden="true">04 / 連絡</span>
    <h2 id="contact-title" class="contact-headline">Vamos criar algo<br><span>impossível de ignorar.</span></h2>
    <div class="contact-details">
      <a class="contact-email" href="mailto:joaopedro1083alves@gmail.com">joaopedro1083alves@gmail.com <span aria-hidden="true">→</span></a>
      <div class="contact-social">
        <a href="https://github.com/alxzyc" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://linkedin.com/in/joão-pedro-alves-lacerda-de-jesus-69a06b3b8" target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
    </div>
    <div class="contact-seal" aria-hidden="true">
      <svg class="final-seal" viewBox="0 0 120 120">...</svg>
    </div>
  </div>
  <footer class="site-footer">
    <span>João Pedro · Creative Developer</span>
    <span>Brasil · © 2026</span>
  </footer>
</section>
```

- Final seal stamp animation on scroll approach (90% progress)
- Email: large, display font, vermilion on hover
- Social: mono font, understated
- Paper texture fills viewport as final gesture

---

## Responsive Adaptation

| Breakpoint | Hero | Projects | Skills | Navigation |
|------------|------|----------|--------|------------|
| ≥1440px | Full asymmetric, max-width 1400px | 3-col grid, featured 2/3 | 3 columns | Full horizontal |
| 1024–1439px | Asymmetric, max-width 1000px | 2-col, featured full | 3 columns | Full horizontal |
| 768–1023px | Stacked: text above, netsuke below | Single column, carousel full | 2+1 columns | Hamburger drawer |
| <768px | Stacked, headline clamp(3rem, 15vw, 5rem) | Single column, swipe carousel | Single column | Hamburger drawer |

---

## Accessibility Checklist

- [ ] Color contrast ≥4.5:1 (paper/ink, vermilion/paper, indigo/paper)
- [ ] Focus visible on all interactive elements (2px solid vermilion, 4px offset)
- [ ] Skip link to main content
- [ ] ARIA labels on icon-only controls
- [ ] `prefers-reduced-motion` honored — all scroll animations become instant
- [ ] `prefers-contrast: more` — paper→ink, ink→paper, vermilion→#FF3B2E
- [ ] Keyboard navigation: tab order = visual order, focus trap in lightbox
- [ ] Semantic HTML: header, nav, main, section, article, footer
- [ ] Alt text on all meaningful images, decorative 3D canvas `aria-hidden`
- [ ] No vestibular triggers (no rapid zoom, no flashing, parallax ≤40px)
- [ ] Touch targets ≥44×44px

---

## Performance Budget

- **Total JS:** <50KB gzipped (Three.js ~35KB, app ~15KB)
- **CSS:** <15KB gzipped
- **Fonts:** Noto Serif JP + Noto Sans JP subset (Latin + common Portuguese) ~40KB each
- **Images:** WebP, responsive srcset, lazy below fold
- **CLS:** <0.1 (reserve space for all async content)
- **LCP:** <2.5s on 3G
- **FID:** <100ms
- **60fps** on mid-range mobile (iPhone SE / Pixel 6a class)

---

## Build Path

**Code-first** — the design system is implemented directly in vanilla HTML/CSS/JS. No comp-led generation needed; the direction is fully specified here.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Three.js crown performance on mobile | Reduce geometry complexity, cap pixel ratio at 1.5, pause when offscreen |
| Noto Serif JP font weight (900) loading | Subset font, `font-display: swap`, fallback to Playfair Display |
| Vermilion contrast on paper | Verify 4.5:1 — if fails, deepen vermilion to #9B0F1E |
| Scroll animation jank | Single rAF, passive listeners, transform/opacity only, `will-change` scoped |
| Paper texture readability | Keep opacity ≤0.04, test with `prefers-contrast: more` |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-11-23 | Initial design system for Japanese Editorial Portfolio redesign | Claude Code + Impeccable |