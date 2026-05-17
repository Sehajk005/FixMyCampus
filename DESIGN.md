---
name: FixMyCampus
description: Campus maintenance issue-reporting and resolution platform for universities.
colors:
  accent: "#6366f1"
  accent-teal: "#14b8a6"
  accent-amber: "#f59e0b"
  bg-base: "#0a0f1e"
  bg-soft: "#0f1830"
  surface: "#0f1629"
  surface-raised: "#151d35"
  surface-high: "#1d2846"
  text-primary: "#f1f5f9"
  text-muted: "#94a3b8"
  success: "#10b981"
  danger: "#ef4444"
  status-submitted: "#fbbf24"
  status-verified: "#60a5fa"
  status-assigned: "#a78bfa"
  status-in-progress: "#fb923c"
  status-resolved: "#34d399"
  status-closed: "#94a3b8"
typography:
  display:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.04em"
  mono:
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "8px"
  md: "10px"
  lg: "16px"
  xl: "20px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "#6366f1"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "#818cf8"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "#ffffff0a"
    textColor: "#94a3b8"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-secondary-hover:
    backgroundColor: "#ffffff14"
    textColor: "#f1f5f9"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-danger:
    backgroundColor: "#ef44441f"
    textColor: "#fca5a5"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  stat-card:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.lg}"
    padding: "20px 24px"
  input-field:
    backgroundColor: "#ffffff0a"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  status-badge:
    backgroundColor: "#6366f126"
    textColor: "{colors.accent}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: FixMyCampus

## 1. Overview

**Creative North Star: "The Campus Signal"**

FixMyCampus is built for people in motion. A student notices a broken light on the way to class — the report takes 45 seconds, the confirmation is instant, the status is always visible. That physical context (bright sunlight, one hand free, ambient urgency) shapes every decision: high contrast, generous touch targets, clear information hierarchy, no clutter.

The system serves three distinct roles across the same product surface. Students need speed and reassurance — a dashboard that tells them their report arrived and is being handled. Technicians need density and efficiency — a queue they can scan and act on without opening a modal. Admins need overview and control — analytics that surface the right numbers without SaaS marketing theatrics. Each role gets what it needs; none are forced into a shared visual template.

The aesthetic is civic, not startup. It borrows the trust vocabulary of good public infrastructure: structured, authoritative, built to last. Not the coldness of government grey, and not the performative energy of a startup landing page. The dark theme reflects physical reality — this system runs on phones and monitors at all hours, and a deep navy base is easier on the eyes at 11pm than blinding white. A light mode exists for bright-office use and is equally functional.

**Key Characteristics:**
- Dark-first, light-optional: deep layered navy, not decorative darkness for its own sake
- Status-forward: the current state of a ticket is the dominant information on every relevant screen
- Role-stratified density: student screens breathe; staff and admin screens are deliberately denser
- Civic not corporate: trustworthy and structured without feeling cold or bureaucratic
- Outdoor-legible: contrast targets exceed WCAG AA — body text aims for AAA ratios in direct sunlight

## 2. Colors: The Campus Signal Palette

A restrained palette anchored in deep navy. Institution Indigo is the single structural accent. Resolution Teal signals completion. Alert Amber signals caution. Six status colors form a learnable vocabulary for the ticket lifecycle.

### Primary
- **Institution Indigo** (`#6366f1`): The single structural accent. Interactive elements — primary buttons, active navigation links, focus rings, progress indicators. Appears on less than 15% of any given screen. Its rarity is its authority.

### Secondary
- **Resolution Teal** (`#14b8a6`): Completion and positive resolution. Paired with Institution Indigo in gradient button fills. Used independently on resolved status states, confirmation copy, and positive call-to-action surfaces.

### Tertiary
- **Alert Amber** (`#f59e0b`): Pending and warning states. Submitted tickets, caution alerts, pending-review indicators. Never decorative.

### Neutral
- **Midnight Canvas** (`#0a0f1e`): Deepest background. Page-level base in dark mode. Never used as foreground.
- **Deepwater Navy** (`#0f1830`): Soft page background for sections needing slight separation from Midnight Canvas.
- **Surface** (`#0f1629`): Default card and container background.
- **Surface Raised** (`#151d35`): Elevated containers — stat tiles, input fields, dropdowns.
- **Surface High** (`#1d2846`): Highest-z surfaces — tooltips, popovers, context menus.
- **Signal White** (`#f1f5f9`): Primary text. A cool blue tint that harmonizes with the navy base — never pure white.
- **Subdued Slate** (`#94a3b8`): Secondary text, labels, placeholders, metadata. The ambient voice.
- **Success Green** (`#10b981`): Resolved and completed states; success confirmations.
- **Fault Red** (`#ef4444`): Errors, destructive actions, critical-priority alerts.

### Status Vocabulary
Six semantic colors map to the ticket lifecycle states. Every status badge pairs color with a text label and a leading dot — color is never the sole carrier of meaning:

| State | Name | Hex |
|---|---|---|
| Submitted | Pending Amber | `#fbbf24` |
| Verified | Trust Blue | `#60a5fa` |
| Assigned | Queue Violet | `#a78bfa` |
| In Progress | Active Orange | `#fb923c` |
| Resolved | Cleared Green | `#34d399` |
| Closed | Archive Grey | `#94a3b8` |

### Named Rules
**The One Signal Rule.** Institution Indigo appears on interactive elements and active states only. Never as a decorative background fill, section divider, or gradient overlay on non-interactive surfaces. Rarity is what gives it weight.

**The Semantic Fence Rule.** Alert Amber, Success Green, and Fault Red are semantic tokens. Reassigning them to non-semantic roles — an amber heading, a green hover accent, a red decorative border — breaks the contract users learn to read.

**The Color-Plus Rule.** Status colors are never the sole carrier of meaning. Every status badge includes a text label and a small dot. Color confirms what text already states; it does not replace it.

## 3. Typography

**Body / UI Font:** Plus Jakarta Sans (weights 400, 500, 600, 700, 800)
**Mono Font:** JetBrains Mono (weights 400, 500)

**Character:** Plus Jakarta Sans is warm but structured — professional without sterility. Its high x-height and wide apertures produce unusual legibility at small sizes, which matters on dense technician queues and outdoor mobile screens. JetBrains Mono grounds technical identifiers with deliberate precision; its presence signals "this is data, read carefully."

### Hierarchy
- **Display** (800 weight, clamp(1.75rem to 2.5rem), 1.1 leading, -0.02em tracking): Page-level greetings and primary headings. One per screen maximum.
- **Headline** (800 weight, 1.25rem, 1.2 leading, -0.01em tracking): Section titles, card headings, modal titles.
- **Title** (700 weight, 1rem, 1.4 leading): Ticket subject lines in lists, table column values, form section headers.
- **Body** (400-500 weight, 0.875rem, 1.6 leading, max 70ch): Descriptions, ticket detail text, notification bodies.
- **Label** (700 weight, 0.75-0.8rem, 0.04em letter-spacing, uppercase): Form field labels, category names, data table column headers.
- **Mono** (400-500 weight, 0.875rem, 1.5 leading): Ticket IDs, timestamps, technical metadata. JetBrains Mono only.

### Named Rules
**The Scale Commitment Rule.** Adjacent hierarchy levels must differ by at least 1.25x in size or a two-step weight jump. Weight-only variation at a single font size produces a flat scale that collapses on dense screens.

**The 70-Character Rule.** Body text is capped at 70ch. Ticket descriptions, onboarding copy, and notification text never stretch wider.

**The Mono Boundary Rule.** JetBrains Mono is for data, not UI copy. Ticket IDs, timestamps, and technical identifiers use mono. Navigation labels, button text, and page copy use Plus Jakarta Sans. Mixing them on the same element is prohibited.

## 4. Elevation

FixMyCampus uses **tonal layering** as its primary depth system, not drop shadows. Five surface steps (Midnight Canvas, Deepwater Navy, Surface, Surface Raised, Surface High) create readable depth without decorative blur. Surfaces at rest carry only a barely-visible 7% white border.

Glows appear only as state responses — hover, focus, active — never as ambient decoration.

### Shadow Vocabulary
- **Hover glow** (`0 0 40px rgba(99,102,241,0.15)`): Applied to interactive cards and stat tiles on hover. Signals "this element responds to you."
- **Focus glow** (`0 0 0 3px rgba(99,102,241,0.15)` alongside accent border): Applied to focused inputs. Two simultaneous signals for keyboard users.
- **Button glow** (`0 0 20px rgba(99,102,241,0.3)` at rest, intensifying to `0 0 30px rgba(99,102,241,0.5)` on hover): Reserved for primary buttons only.
- **Sticky nav frosting** (`backdrop-filter: blur(18px)` with translucent base): The top navigation blurs content below it on scroll — depth through frosted occlusion, not a shadow.

### Named Rules
**The Flat-at-Rest Rule.** Surfaces are flat at rest. Glows appear only in response to user interaction. An idle interface with glowing elements is noise; one that responds to touch with a glow is a signal.

**The Tonal Ladder Rule.** Depth is communicated through surface color steps, not shadow intensity. An element that needs to feel elevated uses Surface Raised or Surface High — not an added drop shadow.

## 5. Components

The component feel is **measured authority**: gently rounded corners, quiet borders that activate on interaction, actions that are legible and confident without demanding attention.

### Buttons
- **Shape:** 10px radius. Not pill, not sharp — approachable without being casual.
- **Primary:** Institution Indigo to Resolution Teal gradient fill, white text, 10px × 20px padding, 600 weight, 0.875rem. Carries a button glow at rest; intensifies and lifts 1px on hover.
- **Primary hover:** Glow intensifies; a white shimmer overlay (`rgba(255,255,255,0.15)`) fades in over the gradient.
- **Secondary:** `rgba(255,255,255,0.04)` fill, 1px subtle border, Subdued Slate text. Hover: fill lifts, text lifts to Signal White, border brightens.
- **Danger:** `rgba(239,68,68,0.12)` fill, 1px `rgba(239,68,68,0.25)` border, `#fca5a5` text. Hover: fill intensifies to 20% opacity.
- **Disabled:** 40% opacity across all variants; `cursor: not-allowed`.

### Status Badges
The most distinctive component in the system — a pill token that communicates the full ticket lifecycle.

- **Shape:** Pill (9999px radius), 4px × 10px padding.
- **Style:** 15% opacity tinted fill, 1px border at 30% opacity, full-opacity status-color text.
- **Leading dot:** 5×5px circle in the status color with a soft radial glow. Always paired with the text label — never the sole indicator.
- **Text:** 0.68rem, 700 weight, 0.04em letter-spacing, uppercase.
- **Six states:** Submitted (amber), Verified (blue), Assigned (purple), In Progress (orange), Resolved (green), Closed (grey).

### Cards / Containers
- **Corner Style:** 16px radius throughout.
- **Background:** Surface (`#0f1629`) by default. Surface Raised (`#151d35`) for stat tiles and input-adjacent containers.
- **Shadow Strategy:** Flat at rest, 1px subtle border only. Interactive cards gain the hover glow and 2px upward lift on hover.
- **Border:** 1px `rgba(255,255,255,0.07)` at rest; brightens to `rgba(99,102,241,0.4)` on interactive card hover.
- **Internal Padding:** 24px standard. Stat tiles use 20px × 24px for tighter density.
- **Glass variant:** `card-glass` uses `rgba(15,22,41,0.7)` fill with `backdrop-filter: blur(20px)`. Reserved for surfaces that genuinely overlay content (login card, overlaid dialogs). Not for dashboard screens.

### Inputs / Fields
- **Style:** `rgba(255,255,255,0.04)` fill, 1px subtle border, 10px radius, 10px × 14px padding.
- **Label:** Above the field, in Label typography (uppercase, 0.8rem, 700 weight, 0.04em tracking), with a 6px gap. Never a placeholder substitute.
- **Focus:** Border shifts to Institution Indigo; 3px focus glow ring wraps the field; fill shifts to `rgba(99,102,241,0.05)`. Transition: 200ms ease.
- **Error state:** Border and glow shift to Fault Red. Error message appears below the field in `#fca5a5` body text — never inside the field, never in a modal.

### Navigation
- **Style:** Sticky top bar, `backdrop-filter: blur(18px)`, 1px bottom subtle border. Background is 84% opaque base color — visibly translucent as content scrolls beneath.
- **Brand mark:** 800 weight, 0.02em letter-spacing. A 12px circle dot in the Institution Indigo to Resolution Teal gradient with a soft glow ring.
- **Links:** 0.83rem, 700 weight, Subdued Slate at rest. Hover and active: Signal White text, `rgba(99,102,241,0.16)` fill at 6px radius.
- **Role chip:** Current user role as a quiet bordered label. 0.72rem, 700 weight, no color treatment — informational only.
- **Mobile:** Nav links collapse at 920px behind a hamburger toggle. Links stack vertically, separated from the brand mark by a top border.

### Skeleton / Loading States
- **Style:** Shimmer gradient (Surface Raised through a faint Institution Indigo highlight and back), 200% width, animated at 1.5s.
- **Usage:** Match the skeleton shape to the content it precedes exactly. A number-sized block for a stat; a full-width block for a description. Generic spinners are prohibited where content shape is predictable.

## 6. Do's and Don'ts

### Do:
- **Do** use Institution Indigo on interactive elements and active states only. Scatter it and it means nothing.
- **Do** pair every status color with a text label and a visual dot. Color confirms meaning; it does not carry it alone.
- **Do** use the tonal surface ladder (Surface, Surface Raised, Surface High) to express depth. Drop shadows at rest are prohibited.
- **Do** size touch targets to a minimum of 44×44px on student-facing screens. Students submit from phones, often one-handed.
- **Do** target WCAG AAA contrast ratios on body text where feasible. Students read this outdoors in direct sunlight; AA is the floor, not the goal.
- **Do** show skeletons in the exact shape of the content they precede. A number-sized skeleton for a stat; a text block for a description.
- **Do** use JetBrains Mono for ticket IDs, timestamps, and technical identifiers. Plus Jakarta Sans for all UI copy.
- **Do** respect `prefers-reduced-motion` globally. The CSS already implements this at the `:root` level; maintain it in every new animation.

### Don't:
- **Don't** build social media patterns: no infinite scroll, no engagement metrics, no notification badges designed to reward compulsive checking.
- **Don't** build gaming UIs: no neon glow used decoratively, no particle effects, no animated backgrounds, no palettes that would fit a dark fantasy interface.
- **Don't** build SaaS marketing dashboards: no hero-metric template (big number, small label, gradient accent card), no marketing copy inside the app.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe on cards, alerts, or list items. Use a full border, a background tint, or a leading icon instead.
- **Don't** use gradient text (`background-clip: text` with a gradient background). A single solid color at heavier weight communicates importance without decorative noise.
- **Don't** reach for a modal first. Inline states, expandable rows, and progressive disclosure handle most cases. Modals are justified only for destructive confirmations.
- **Don't** use `card-glass` on dashboard surfaces. Backdrop blur is reserved for surfaces that genuinely overlay content. Dashboard cards are flat.
- **Don't** flatten the type scale. Adjacent hierarchy levels must differ by at least 1.25x in size or a two-step weight jump.
- **Don't** use Alert Amber, Success Green, or Fault Red for non-semantic decoration. These carry meanings users learn. Reassigning them erodes trust in the status system.
- **Don't** use color alone to convey status or priority. Always pair with a label, icon, or pattern.
