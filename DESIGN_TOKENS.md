# SiglarCarbon Design System Implementation

This document outlines how the SiglarCarbon design tokens have been applied throughout the application.

## Color System

### Brand Colors
- **Primary Teal**: `#00b0b8` - Used for primary actions, navigation hover states, links
- **Primary Green**: `#30A788` - Used for secondary actions, accents
- **Primary Dark Blue**: `#1f5c70` - Used for footer, dark sections
- **Muted Blue**: `#546681` - Used for secondary elements
- **Light**: `#F4F8F9` - Used for background accents, subtle backgrounds
- **Accent**: `#E2EEF1` - Used for secondary text in footer, badges

### Text Colors
- **Primary**: `#1A1A1A` - Main content text
- **Secondary**: `#4F4F4F` - Secondary content, metadata
- **Muted**: `#7A7A7A` - Tertiary text, placeholders

### Status Colors
- **Active**: `#30A788` - Active schemes (using brand green)
- **Upcoming**: `#ffb607` - Upcoming schemes (brand yellow)
- **Discussion**: `#DB3E42` - Under discussion schemes (brand red)

### Neutral Colors
- **Border**: `#E5E7EB` - All borders, dividers
- **Hover**: `#F3F4F6` - Hover states for interactive elements

## Typography

### Font Family
- **Headings**: Freight Sans Pro (loaded via CDN Fonts)
- **Body**: Lato (loaded via Google Fonts)
- **Fallback**: system-ui, -apple-system, sans-serif

### Font Weights
- Light: 300 (Lato only)
- Regular: 400 (body text)
- Bold: 700 (emphasis, headings)
- Black: 900 (Lato only, strong emphasis)

### Font Sizes
- XS: 0.75rem (12px) - small labels
- SM: 0.875rem (14px) - secondary text
- Base: 1rem (16px) - body text
- LG: 1.125rem (18px) - emphasized text
- XL: 1.25rem (20px) - small headings
- 2XL: 1.5rem (24px) - medium headings
- 3XL: 1.875rem (30px) - large headings
- 4XL: 2.25rem (36px) - hero text

### Line Heights
- Normal: 1.5 (body text)
- Relaxed: 1.75 (longer content)
- Headings: 1.2

## Spacing

Using 8px base unit:
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px

## Border Radius

- SM: 4px - small elements
- MD: 8px - cards, inputs
- LG: 12px - larger containers

## Component Applications

### Navigation
- Background: White
- Text: text-secondary
- Hover: text-brand-primary
- CTA Button: bg-brand-primary, hover:bg-brand-primary-dark

### Footer
- Background: brand-primary-dark
- Text: brand-light, brand-accent
- Links hover: white

### Filter Bar
- Background: White
- Borders: neutral-border
- Inputs: border-neutral-border, focus:ring-brand-primary
- Clear button: text-secondary, hover:text-primary

### Sidebar
- Background: background-sidebar (#F9FAFB)
- Border: neutral-border
- List items hover: neutral-hover
- Text: text-primary, text-secondary

### Scheme Details
- Tabs active: border-brand-primary, text-brand-primary
- Tabs inactive: text-secondary
- Content: text-primary, text-secondary
- Status badges: status-active/upcoming/discussion
- CTA buttons: brand-primary

### Map
- Area fills: status colors with 20% opacity
- Area borders: status colors
- Port pins: status colors
- Clusters: brand-primary
- Selected scheme: flies to location

### CTA Section
- Background: brand-primary
- Text: white, brand-accent
- Primary button: white bg, brand-primary text
- Secondary button: white border, white text

## Accessibility

- All color combinations meet WCAG 2.1 AA contrast requirements
- Focus states use brand-primary ring
- Keyboard navigation fully supported
- Screen reader announcements for dynamic content
- Semantic HTML throughout

## Usage in Tailwind

Colors are available as Tailwind classes:
- `bg-brand-primary`, `text-brand-primary`
- `bg-status-active`, `text-status-active`
- `border-neutral-border`
- `hover:bg-neutral-hover`

All design tokens are configured in `tailwind.config.js`.
