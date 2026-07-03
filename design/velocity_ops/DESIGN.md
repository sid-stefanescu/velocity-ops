---
name: Velocity Ops
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  headline-lg:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-display:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 12px
  margin-desktop: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The design system is engineered for high-stakes logistics environments where information density and rapid decision-making are paramount. The brand personality is functional, authoritative, and urgent, reflecting the physical reality of a fast-moving warehouse floor. It targets warehouse managers and floor operators who require "at-a-glance" situational awareness.

The visual style is a **Modern Industrial** hybrid. It combines the utilitarian clarity of traditional logistics signage with the streamlined efficiency of modern SaaS. It utilizes high-contrast interfaces, rigid structural grids, and purposeful color application to direct attention to bottlenecks and critical alerts. The aesthetic prioritizes legibility over decoration, ensuring that data is the primary interface element.

## Colors

The palette is anchored by a deep industrial navy (`primary`) for structural elements and a high-visibility blue (`secondary`) for primary actions. The background remains a very light grey to reduce glare in brightly lit industrial environments, while critical data surfaces use pure white to maximize contrast.

Color is used primarily as a communication tool:
- **Urgent Red:** Immediate action required (e.g., late departures, safety alerts).
- **Warning Amber:** Potential bottlenecks or upcoming deadlines.
- **Success Green:** Completed tasks and healthy throughput.
- **Neutral Slate:** Structural borders and secondary metadata.

A high-contrast ratio (7:1 or higher for critical text) is maintained throughout the system to ensure visibility on mobile devices used under varied lighting conditions.

## Typography

This design system uses a dual-font strategy. **JetBrains Mono** is utilized for headlines, labels, and all numerical data to evoke a technical, precise feel and to ensure numbers (like pallet counts or timestamps) are easily distinguishable. **Inter** is used for body text to maintain high readability for longer strings of information.

Large, bold headlines are reserved for high-priority metrics. Labels are always in uppercase with increased letter spacing to create a clear visual distinction between "Category" and "Value." Data-heavy views prioritize the monospace font to ensure vertical alignment of digits in tables.

## Layout & Spacing

The layout follows a **Fluid Grid** system designed for high data density. On mobile, it utilizes a 4-column grid with tight 12px margins to maximize screen real estate. On desktop, it expands to a 12-column grid with a fixed sidebar for navigation.

The spacing rhythm is based on a 4px baseline. Components are tightly packed using "Stack" units (8px or 16px) to allow more information to be visible without scrolling. Content is organized into modular "Cards" that represent specific warehouse zones or truck schedules, allowing for easy reflow when switching between portrait and landscape modes on ruggedized tablets.

## Elevation & Depth

To maintain a clean and professional look, this design system avoids heavy shadows. Instead, it uses **Tonal Layers** and **Low-Contrast Outlines**.

- **Level 0 (Background):** The base canvas (`#F8FAFC`).
- **Level 1 (Cards/Surfaces):** Pure white background with a 1px solid border (`#E2E8F0`). This creates a crisp, physical separation between data modules.
- **Level 2 (Modals/Popovers):** A very soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)) is used only for temporary overlays to indicate they are floating above the main work surface.
- **Interactive States:** Hover or active states are indicated by subtle background color shifts (e.g., White to Slate-50) rather than elevation changes.

## Shapes

The shape language is "Soft" (`roundedness: 1`), utilizing a 4px (0.25rem) radius for standard components and 8px (0.5rem) for cards. This slight rounding provides a modern feel while maintaining the rigid, efficient structure expected of industrial software. 

Buttons and input fields use the standard 4px radius. Status indicators (dots or thin bars) should remain sharp or only slightly rounded to look like precision instruments.

## Components

### Buttons
Primary buttons use the Secondary Blue with white text. Secondary buttons use a white background with a Slate-200 border. High-urgency "Stop" or "Alert" actions use Status Red. All buttons have a minimum touch target of 44px for mobile use.

### Status Chips
Chips are used extensively for "In Progress," "Delayed," or "Completed" statuses. They use a low-opacity background of the status color with a high-contrast text version (e.g., light green background with dark green text).

### Data Lists & Tables
Lists on mobile should be "dense," using monospaced typography for numerical values and timestamps. Use 1px horizontal dividers rather than vertical lines to keep the interface clean.

### Input Fields
Inputs must have clear, persistent labels in `label-caps`. The focus state uses a 2px blue border. For warehouse use, inputs should be optimized for numeric keypad entry where applicable.

### Cards
Cards are the primary container. Each card should have a clear header with a JetBrains Mono title and a status indicator in the top-right corner. Internal padding within cards is kept to a strict 16px.

### Critical Alerts
A full-width banner at the top of the dashboard for "Urgent" items. Use the Status Red background with white JetBrains Mono bold text to ensure it cannot be ignored.