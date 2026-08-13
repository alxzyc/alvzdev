---
name: creative-frontend
description: Design and implement polished, immersive portfolio sites and landing pages with scroll-driven storytelling, pinned sections, parallax, smooth scrolling, 2D/3D motion, WebGL, GSAP ScrollTrigger, Lenis, Three.js, or React Three Fiber. Use when Codex must create, improve, debug, or review an expressive frontend experience in which scrolling controls animation or scene progression, including cinematic transitions, product showcases, interactive portfolios, and performant accessible alternatives for mobile and reduced motion.
---

# Creative Frontend

Create immersive interfaces that remain usable, fast, responsive, and maintainable. Treat motion as part of the information architecture, not as decoration added at the end.

## Establish the experience

Before implementation:

1. Inspect the existing project, framework, styling conventions, dependencies, routes, and build commands.
2. Identify the page's narrative: what the visitor should notice, understand, and do in each section.
3. Choose a visual concept tied to the subject instead of defaulting to generic gradients, floating cards, glassmorphism, or arbitrary particles.
4. Define the motion system in plain language: entry, scroll progression, pinned moments, transitions, exit, and reduced-motion behavior.
5. Reuse the project's stack and components unless a new dependency clearly reduces complexity or enables a required effect.

When the visual direction is underspecified, make a coherent design decision and state it briefly. Ask only when the missing choice would materially change the product or require a new external asset.

## Choose the smallest suitable motion stack

Use CSS transitions, transforms, keyframes, `position: sticky`, and Intersection Observer for simple reveals, sticky storytelling, and modest parallax.

Use GSAP with ScrollTrigger when the experience needs one or more of:

- animation progress mapped continuously to scroll;
- pinned sections or long scrubbed timelines;
- coordinated sequences across several elements;
- snapping between deliberate story beats;
- reliable cleanup and responsive timeline reconstruction.

Use Lenis only when smooth scrolling materially improves the intended feel. Integrate it with the animation ticker and preserve native semantics, keyboard navigation, anchors, and user control. Do not use smoothing to hide poor frame performance.

Use Three.js or React Three Fiber only when real depth, a movable camera, lighting, shaders, particles, or 3D assets are central to the concept. Prefer ordinary DOM and CSS for text, forms, navigation, and accessible content.

Do not add multiple animation libraries that solve the same problem. Confirm package versions and current APIs from the installed project or official documentation before writing integration code.

## Build the narrative timeline

Model the page as a sequence of states rather than unrelated effects:

1. **Arrival:** establish hierarchy immediately; the page must make sense before animation begins.
2. **Orientation:** reveal the relationship between the headline, subject, and first interaction.
3. **Transformation:** map scroll progress to meaningful changes such as camera travel, object assembly, masking, typography, or spatial transitions.
4. **Resolution:** return control to normal document flow and make the next action obvious.

For scroll-linked sequences, define start and end states explicitly. Animate mostly `transform` and `opacity`. Avoid layout-changing properties inside high-frequency updates.

Use a single timeline for a tightly coordinated scene. Use independent triggers for unrelated sections. Name selectors and timeline segments by narrative role rather than visual accident.

## Implement safely

- Preserve semantic document order even when the visual presentation is layered.
- Keep primary copy and calls to action in the DOM.
- Scope animation setup to the owning component and revert or kill it on unmount.
- Recalculate responsive geometry after relevant fonts, images, and 3D assets load.
- Use match-media or equivalent branches when mobile motion needs a different composition.
- Use `clamp()`, fluid spacing, and bounded scene dimensions rather than assuming one viewport.
- Avoid animating every element. Create contrast between stillness and motion.
- Prefer deterministic timelines over many overlapping event listeners.
- Do not hijack wheel or touch input, disable browser scrolling, or replace the scrollbar merely for style.
- Avoid fake loading screens. If loading is necessary, show real progress or a useful lightweight state.

## Handle 3D and WebGL

Treat the canvas as a progressive enhancement:

- Provide a meaningful DOM composition beneath or beside it.
- Set a sensible renderer pixel-ratio cap; do not blindly use the device maximum.
- Resize the renderer and camera correctly without allocating objects every frame.
- Pause or reduce rendering when the scene is offscreen or the tab is hidden.
- Dispose of geometries, materials, textures, render targets, controls, and listeners on teardown.
- Compress and optimize models and textures. Load only what the current scene needs.
- Keep lighting and shader complexity proportional to the target devices.
- Use a static or lightweight fallback when WebGL is unavailable.

In React, keep rapidly changing animation state outside React render cycles when possible. Mutate refs in the render loop and reserve component state for meaningful UI state.

## Protect accessibility

Implement `prefers-reduced-motion` as a real alternate experience, not merely a shorter duration. Remove scrubbed movement, large parallax, camera travel, and nonessential loops while preserving all content and actions.

Also ensure:

- keyboard focus remains visible and follows logical DOM order;
- pinned content does not trap focus or cover focused controls;
- contrast remains sufficient throughout animated states;
- text remains selectable and readable;
- animation does not depend only on hover;
- canvas content has an accessible textual counterpart;
- flashing, rapid zoom, and excessive vestibular motion are avoided.

## Meet performance targets

Design for stable frame pacing and fast first interaction:

- animate composited properties when practical;
- batch DOM reads before writes and avoid forced synchronous layout;
- use passive listeners where appropriate;
- minimize per-frame allocations and expensive React rerenders;
- lazy-load below-the-fold media and heavy 3D code;
- reserve media dimensions to prevent layout shift;
- optimize images and use responsive sources;
- profile before applying speculative micro-optimizations.

If the experience is slow on mid-range mobile hardware, reduce scene complexity, effects, pixel ratio, and simultaneous motion before sacrificing usability.

## Preserve visual quality

Create deliberate art direction:

- establish a clear type scale, spacing rhythm, palette, and focal hierarchy;
- use one strong motif consistently;
- make transitions explain relationships between sections;
- keep controls recognizable even when styling is expressive;
- ensure the static frame at any scroll position still looks composed;
- avoid copying the exact identity, layout, or assets of an inspiration site.

When references are provided, extract principles such as pacing, depth, composition, or transition grammar. Produce an original implementation suited to the user's content and brand.

## Verify the result

Run the project's relevant checks and inspect the page at desktop and mobile sizes. Verify at minimum:

1. initial load and direct navigation to anchors;
2. forward and reverse scrolling, including rapid direction changes;
3. section pinning and release without jumps or blank gaps;
4. resizing and orientation changes;
5. keyboard navigation and visible focus;
6. reduced-motion behavior;
7. cleanup after route changes or component remounts;
8. missing, delayed, or failed media assets;
9. absence of console errors and obvious performance regressions.

If browser automation is available, use it for functional checks and screenshots. Visual inspection is required for visual work; do not rely only on tests or compilation.

## Explain the handoff

Lead with what was built. Mention the motion architecture, important accessibility and performance decisions, files changed, and checks performed. Call out any asset, browser, or device limitations honestly. Keep the explanation proportionate to the change.


