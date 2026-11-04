---
name: JL DEVS
description: User-approved Apple minimalism with optical Liquid Glass and transmitted brand green.
colors:
  ink: "#141315"
  muted: "#585c63"
  green: "#a3ff3f"
  green-dark: "#356d12"
  paper: "#f6f8fa"
  line: "#18251c1c"
  white: "#ffffff"
  hero-ground: "#edf3f6"
  project-ground: "#eff3f5"
  process-ground: "#f7f9fb"
  focus: "#487a23"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(46px, 5.2vw, 86px)"
    fontWeight: 700
    lineHeight: 1.035
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(32px, 3.6vw, 54px)"
    fontWeight: 650
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "21px"
    fontWeight: 550
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "16px"
    lineHeight: 1.65
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "15px"
    fontWeight: 550
rounded:
  focus: "8px"
  founder: "24px"
  project: "26px"
  dock-mobile: "30px"
  contact: "38px"
  pill: "99px"
spacing:
  compact-gap: "8px"
  control-gap: "15px"
  dock-mobile-inset: "16px"
  mobile-gutter: "22px"
  card-inset: "30px"
  section-mobile: "65px"
  section-tablet: "75px"
  section-desktop: "120px"
components:
  button-primary:
    textColor: "#12200b"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "14px 26px"
  button-clear:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "14px 26px"
  navigation:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    width: "min(912px, calc(100% - 80px))"
    height: "clamp(64px, 5.72vw, 88px)"
  service-dock:
    textColor: "{colors.ink}"
    rounded: "3.5vw"
    padding: "1.6vw 2vw"
  project-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.project}"
  founder-card:
    textColor: "{colors.ink}"
    rounded: "{rounded.founder}"
    padding: "{spacing.card-inset}"
---

# Design System: JL DEVS

## Overview

**Creative North Star: "Liquid Glass / Apple minimalism"**

White and silver provide a calm reading ground for near-black Inter typography. Translucent controls catch bright optical rims and diffuse shadows; brand green is transmitted through the primary action, active service tab and JL sculpture. This is the user-approved Apple minimalism / Liquid Glass world.

The supplied logo remains the identity anchor. Raster artwork supplies only the environmental glass and JL sculpture; navigation, headings, service controls and contact actions are semantic interface elements. The built source is normative for measurements; the approved comp establishes material and atmosphere.

**Key Characteristics:**
- Airy white and silver surfaces with clear dark text.
- Inter for display, body and controls.
- Green transmitted through optical glass, with restrained ambient depth.
- Responsive semantic controls and an optional animated scene.

## Colors

Cool white and silver are the reading surfaces; transmitted green carries the brand and active states. Frontmatter values are extracted from the shipped stylesheet, including its alpha-bearing divider color.

### Primary

- **Brand Green** (`green`): primary glass action transmission, selection and identity artwork.
- **Deep Brand Green** (`green-dark`): the declared dark companion to the brand green; functional details also use locally tuned dark green shades in the source.

### Neutral

- **Near-black Ink** (`ink`): headings and primary text.
- **Cool Muted Gray** (`muted`): descriptive copy.
- **Cool Paper** (`paper`) and **White** (`white`): page and card reading surfaces.
- **Silver Hero Ground** (`hero-ground`): the scene environment.
- **Project Ground** (`project-ground`) and **Process Ground** (`process-ground`): quiet tonal section separation.
- **Translucent Divider** (`line`): service rows, project action separators and footer rules.
- **Focus Green** (`focus`): visible keyboard focus, independent of glass reflection.

**The Transmitted Green Rule.** Concentrate bright brand green in glass actions, selected controls and brand artwork; use darker greens for readable small functional details.

## Typography

**Display Font:** Inter, sans-serif. **Body Font:** Inter, sans-serif. There is no distinct active mono or label family. The user explicitly requested Inter; CSS assigns both global font roles to it.

### Hierarchy

- **Display:** tight, bold hero headline using the frontmatter display role; mobile switches to `clamp(36px, 8.9vw, 62px)` with line-height (1.07), then (34px) below the small-phone breakpoint.
- **Headline:** section headings use the frontmatter headline role. The hero services heading is bolder (700); about/contact headings reach `clamp(36px, 4vw, 60px)` on desktop.
- **Title:** service and process titles use the frontmatter title role; project titles use (26px/600), founder titles (24px/600), and dock titles (2.6vw/650) on desktop.
- **Body:** base body uses the frontmatter body role. Content descriptions usually use (14–17px). Hero supporting copy uses `clamp(20px, 2.1vw, 34px)` with line-height (1.23), then `clamp(17px, 4.5vw, 25px)` / (1.35) on mobile.
- **Label:** controls use the frontmatter label role. Hero actions scale to (1.65vw) on desktop; mobile actions use (13px). Navigation remains sentence case.

**The Inter Rule.** Use Inter for the shipped visual hierarchy, including display text. Imported Space Grotesk and JetBrains Mono are not active type roles.

## Layout

The hero is a responsive composition: left-aligned copy and optical actions, JL sculpture on the right, then a wide centered service dock. Desktop hero dimensions track viewport width; above (1700px) the scene is capped at (1700px) and key controls receive explicit large-screen sizing. The standard content container is `min(1240px, calc(100% - 112px))`.

The container changes to (80px) total gutters at (1150px), (44px) at (700px), and (36px) at (370px). Standard section padding steps from (120px) to (90px), (75px), then (65px). Intro blocks combine a broad heading with a narrower description; project and founder grids are two columns. The process grid is four columns, becoming two at (900px).

At (700px), navigation becomes a menu, hero copy leads above the sculpture, actions may wrap, the service dock stacks its tabs above its panel, project/founder/contact grids become one column, and footer groups stack. Mobile scene cropping is deliberate: (930px) wide, positioned at `translateX(-73%)`, with a top/bottom gradient mask to blend the raster seam. Keep this crop subordinate to readable live copy. The dock content reserves (155px) minimum height on mobile to limit layout shifts.

## Elevation & Depth

Glass uses translucent gradients, backdrop blur, directional white inset highlights and diffuse colored shadows. Depth belongs to controls and identity material; the long reading sections rely on quiet tonal changes and hairline separators. The background sculpture is an image with optional shader distortion, not a live geometric 3D model.

### Shadow Vocabulary

- **Glass panel:** `inset 0 1px 2px #fff, inset 1px 0 1px #ffffffe6, inset -1px -1px 2px #ffffffb8, 0 16px 44px #3f5c6610`; paired with `blur(20px) saturate(1.2)`.
- **Primary optical action:** `inset 0 3px 3px #ffffffed, inset 3px 0 5px #edffd4, inset -2px -3px 3px #5b8f3c66, 0 8px 18px #6fa63c24`.
- **Selected service glass:** `inset 2px 3px 4px #fff, inset -2px -3px 3px #90bb6866, 0 10px 22px #75a24912`.
- **Project card:** `0 14px 45px #32424508`, rising to `0 24px 50px #32424512` on hover.

**The Optical Rim Rule.** Glass combines a translucent gradient, bright inset edges and a soft ambient shadow. Preserve the layered rim on primary actions and the selected service tab.

## Shapes

Pills frame navigation and actions. Content containers use broader rounded rectangles: project, founder and contact values are in frontmatter; mobile project cards soften to (24px) and contact panels to (29px). The desktop dock uses viewport-scaled curvature and becomes a (30px) container on mobile. Founder initials are identity placeholders in rounded glass tiles, not photographs.

Primary actions and the active dock tab have a masked gradient rim (1.5px). Keep this optical contour separate from the keyboard focus outline (3px, offset 5px). Native service disclosures use round expand affordances. Section dividers are thin and low contrast rather than elevated panels.

## Components

### Buttons

Pill actions have a clear or green-transmitted glass fill. Base sizing is in frontmatter, with minimum height (52px), a live inline icon where present, and the optical rim described above. Hover lifts by (3px); active returns to baseline and scales to (0.98). A diagonal reflection travels across glass on hover over (0.65s). Hero and contact contexts have their own responsive sizing; do not force the base dimensions onto them. Primary hero action scrolls to the two real founder contact choices.

### Navigation

A fixed floating capsule carries the supplied logo and four anchor links. Hover and active section states draw a short green underline over (0.25s). At the mobile breakpoint the explicit menu button controls a glass dropdown via `aria-expanded`; Escape closes it and restores focus to the toggle. The active anchor uses `aria-current="location"`. Preserve the skip link and scroll offsets for the fixed header.

### Service dock

Three icon tabs control one service description. The selected tab has green transmission, stronger type and the shared optical rim. Arrow keys cycle tabs; Home/End select the extremes; inactive tabs leave the tab sequence. `tablist`, `tab`, `tabpanel`, selection and label relationships are implemented. The selected plate slides using a spring (stiffness 330, damping 30); the panel transitions over (0.16s). Paused/reduced motion removes the sliding transition.

### Service disclosures

Six native details/summary rows keep the extended service offering readable and keyboard operable. Desktop rows combine a line icon, service title, short description and expand control; the short description hides below (900px). Open details reveal a paragraph and contact link. Do not convert these to a decorative card grid without a new design decision.

### Cards and project illustrations

Project cards combine an illustration stage, live project name, factual description and contact anchor. They lift by (7px) on hover. The two current stages use light lavender and muted green local art palettes; these are illustration colors, not global accent tokens. Both visibly say “Composição visual ilustrativa”. There are no verified product screenshots, metrics, clients, testimonials or project links. ODIOPAY is identified as sandbox; Second Server / Client as customized game server/client. The letter-based glass objects are current illustrative placeholders, not a reusable icon system.

Founder cards use supplied names, initials tiles, truthful role text and a direct WhatsApp arrow. Contact repeats the same two named founders in a broad light glass panel. No input or form component exists in the shipped page; do not invent form tokens.

### Motion and fallback

Reveal elements begin visible (`initial={false}`), then use one-time viewport motion over (0.9s), ease `[0.16, 1, 0.3, 1]`; process progress uses a spring (90/25). The fixed pause control exposes its state with `aria-pressed` and Portuguese accessible labels. Pause stops the scene, bypasses reveal/dock motion and shows the process line fully; CSS animation playback is paused. Hover transitions remain available under manual pause. Under `prefers-reduced-motion`, CSS transitions and animation are removed, reveal content stays visible, smooth scrolling becomes automatic, the canvas is hidden and the pause control is omitted.

The decorative scene is `aria-hidden` and always has an underlying static image. WebGL adds small pointer/scroll bends and slow caustics, capped at roughly (31fps), device-pixel ratio (1.25), and render width (1800px). Offscreen or hidden documents stop the drawing loop; resources/listeners are cleaned up. Unavailable WebGL, compilation failure or context loss returns to the static image. Unsupported backdrop blur gets a more opaque reading surface and a solid green action fallback. These behaviors preserve meaning without animated rendering.

## Do's and Don'ts

### Do:
- **Do** preserve Inter and the approved white, silver and green Liquid Glass material.
- **Do** keep functional text and controls in semantic code, with a visible focus outline.
- **Do** preserve both the reduced-motion path and the user pause control when extending animation.
- **Do** identify project compositions as illustrative until real, authorized captures are available.
- **Do** stack the service dock and content grids at the established mobile breakpoint.

### Don't:
- **Don't** restore the rejected dark green code-editor visual world.
- **Don't** turn illustrative project objects into evidence of an actual product interface, client result or metric.
- **Don't** promote the project letter glyph objects or removed eyebrow tags into reusable interface primitives.
- **Don't** place essential text or interactive controls inside the raster scene.

Not canonized: the project stages still contain decorative letter glyph objects; record them as honest illustrative placeholders rather than teaching them as a reusable interface language. Removed project eyebrow markup and its unused CSS are not component guidance. No source or configuration changes are part of this documentation pass.
