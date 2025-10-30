# Project Knowledge Base Instructions

## Project Overview

This is a **maritime emission schemes visualization application** built with:

- **React 18** with TypeScript
- **Vite** as the build tool and dev server
- **Supabase** for data persistence and real-time updates
- **Mapbox GL** for interactive map visualization
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Lucide React** for icons

The application displays emission schemes on an interactive map, allowing users to filter by region, status, start year, and route.

## Technology Stack

### Core Dependencies
```json
{
  "@supabase/supabase-js": "Database client and real-time subscriptions",
  "mapbox-gl": "Interactive map visualization",
  "react": "UI framework",
  "zustand": "Lightweight state management",
  "lucide-react": "Icon library",
  "tailwindcss": "Utility-first CSS framework"
}
```

### Development Tools
- TypeScript for type safety
- ESLint for code quality
- Vite for fast development and optimized builds

## Data Persistence Standards

### Always Use Supabase
**CRITICAL**: Supabase must ALWAYS be used for data persistence unless explicitly requested otherwise.

### Database Configuration
- Client is configured in `src/lib/supabase.ts`
- TypeScript types are defined in `src/types/database.ts`
- Required environment variables (in `.env`):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### Database Schema
The main table is `schemes` with the following structure:
- `id` (string) - Unique identifier
- `name` (string) - Scheme name
- `region` (string) - Geographic region
- `mode` (string) - Either 'area' or 'port'
- `status` (string) - 'Active', 'Upcoming', or 'Under discussion'
- `start_year` (number) - Year the scheme starts
- `article_url` (string, optional) - Link to more information
- `coverage` (jsonb) - Details about coverage (legs, gases, scope, vessel types)
- `costs` (jsonb) - Cost information
- `compliance` (jsonb) - Compliance requirements
- `geometry` (jsonb) - GeoJSON for map visualization
- `icon_position` (jsonb, optional) - Custom icon position for map markers
- `layer_order` (number) - Z-index for map layer ordering
- `created_at` (timestamp) - Record creation time
- `updated_at` (timestamp) - Last update time

### Data Service Pattern
- Database operations are abstracted in `src/services/schemeService.ts`
- The Zustand store (`src/store/useSchemeStore.ts`) manages application state
- Real-time updates are handled via Supabase subscriptions

## Design System and Styling

### Color Palette
**CRITICAL**: NEVER use purple, indigo, or violet hues unless explicitly requested.

The brand uses a **blue and teal** color scheme defined in `DESIGN_TOKENS.md` and `tailwind.config.js`:

#### Brand Colors
- **Primary Blue**: `#005670` - Primary actions, navigation, links
- **Primary Dark**: `#003E50` - Footer, button hover states
- **Light**: `#F4F8F9` - Background accents
- **Accent**: `#E2EEF1` - Secondary text, badges

#### Text Colors
- **Primary**: `#1A1A1A` - Main content
- **Secondary**: `#4F4F4F` - Secondary content
- **Muted**: `#7A7A7A` - Tertiary text

#### Status Colors
- **Active**: `#0E9F6E` (green)
- **Upcoming**: `#D97706` (amber)
- **Discussion**: `#F59E0B` (yellow)

### Typography
- **Body Font**: Lato (via Google Fonts)
- **Heading Font**: Freight Sans Pro (via CDN Fonts)
- **Weights**: 300 (light), 400 (regular), 700 (bold), 900 (black)
- **Sizes**: Use Tailwind's size scale (xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
- **Line Height**: 1.5 for body, 1.2 for headings

### Spacing
Use the 8px base unit system:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Border Radius
- sm: 4px
- md: 8px
- lg: 12px

### Tailwind Usage
All custom colors are available as Tailwind classes:
```css
/* Brand colors */
bg-brand-primary, text-brand-primary
bg-brand-primary-dark, text-brand-primary-dark
bg-brand-light, text-brand-light
bg-brand-accent, text-brand-accent

/* Text colors */
text-primary, text-secondary, text-muted

/* Status colors */
bg-status-active, text-status-active
bg-status-upcoming, text-status-upcoming
bg-status-discussion, text-status-discussion

/* Background colors */
bg-background-page, bg-background-sidebar

/* Borders */
border-neutral-border
hover:bg-neutral-hover
```

## Component and Code Conventions

### File Organization
- **Components**: `src/components/` - React components
- **Types**: `src/types/` - TypeScript type definitions
- **Utils**: `src/utils/` - Utility functions
- **Services**: `src/services/` - Data access layer
- **Store**: `src/store/` - Zustand state management
- **Lib**: `src/lib/` - Third-party library configurations

### Component Structure
- Use functional components with hooks
- TypeScript strict mode enabled
- Props should be explicitly typed
- Export components as named exports

### Styling
- **Always use Tailwind CSS** utility classes
- Follow the design system in `DESIGN_TOKENS.md`
- Use custom theme values from `tailwind.config.js`
- Avoid inline styles unless absolutely necessary

### Icons
- **Always use Lucide React** for icons
- Import only the icons you need: `import { IconName } from 'lucide-react'`
- Do not install additional icon libraries

### State Management
- Global state is managed by Zustand in `src/store/useSchemeStore.ts`
- The store handles:
  - Loading schemes from Supabase
  - Filtering and sorting
  - Selected scheme tracking
  - Real-time updates
  - URL state synchronization

### TypeScript Conventions
- Define interfaces for all data structures
- Use type definitions from `src/types/`
- Avoid `any` types - use proper typing
- Database types are in `src/types/database.ts`
- Application types are in `src/types/scheme.ts`

## Development Guidelines

### Do NOT Create Unless Requested
- Do not proactively create documentation files (README.md, etc.)
- Do not create test files unless requested
- Do not add features that weren't requested

### Design Philosophy
- All designs should be **production-ready and beautiful**
- Not cookie-cutter - pay attention to details
- Follow modern design principles
- Ensure proper contrast ratios for accessibility
- Implement responsive design (mobile-first approach)

### Code Quality
- Keep files at manageable sizes
- Follow single responsibility principle
- Use proper imports/exports
- Never use global variables for state
- Remove unused code and files

### Package Management
- Do not install additional UI libraries without necessity
- Check if a library is already in use before suggesting a new one
- Prefer built-in browser APIs and React features over external libraries

## Application Architecture

### Data Flow
1. **Supabase** stores all scheme data
2. **schemeService.ts** provides data access methods
3. **useSchemeStore.ts** manages application state
4. **Components** subscribe to store changes
5. **URL state** is synchronized for shareable links

### Key Features
- **Interactive Map**: Displays schemes as polygons (areas) or markers (ports)
- **Filtering**: By region, status, start year, and route
- **Details Panel**: Shows comprehensive scheme information
- **Real-time Updates**: Automatically reflects database changes
- **URL State**: Filters and selected scheme are encoded in URL
- **Responsive Design**: Works on mobile and desktop

### Component Hierarchy
```
App.tsx
├── SiteShell (header + footer)
├── FilterBar (filtering controls)
├── Sidebar (scheme list)
│   ├── SchemeSelector
│   └── SchemeDetails
│       └── SchemeTooltip
├── MapView (Mapbox visualization)
└── CTASection (call-to-action)
```

## Environment Setup

### Required Environment Variables
Create a `.env` file with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

### Development Commands
```bash
npm run dev        # Start dev server (handled automatically)
npm run build      # Build for production
npm run lint       # Run ESLint
npm run typecheck  # Type check without emitting
npm run preview    # Preview production build
```

## Integration Patterns

### Mapbox Integration
- Configuration in `src/components/MapView.tsx`
- Uses custom layers for scheme visualization
- Color-coded by status (active, upcoming, discussion)
- Click handlers for scheme selection
- Clustering for port markers

### URL State Management
- Implemented in `src/utils/urlState.ts`
- Encodes filters and selected scheme in URL query parameters
- Enables shareable links
- Updates browser history without page reload

### Real-time Updates
- Supabase real-time subscriptions in `useSchemeStore.ts`
- Automatically updates when data changes in database
- Handles INSERT, UPDATE, and DELETE operations

## Best Practices

### When Adding Features
1. Check existing patterns and conventions
2. Use the established component structure
3. Follow the design system strictly
4. Ensure TypeScript types are properly defined
5. Test responsive behavior
6. Always run `npm run build` before considering task complete

### When Modifying Database
1. Always use Supabase migrations
2. Update TypeScript types in `src/types/database.ts`
3. Update service methods if needed
4. Test real-time subscriptions still work

### When Styling
1. Reference `DESIGN_TOKENS.md` first
2. Use Tailwind custom theme values
3. Avoid creating new color values
4. Maintain consistent spacing using the 8px system
5. Ensure proper contrast for accessibility

## Common Patterns

### Fetching Data
```typescript
const { data, error } = await supabase
  .from('schemes')
  .select('*')
  .eq('status', 'Active');
```

### Using Store
```typescript
const { schemes, filters, setFilters } = useSchemeStore();
```

### Styling Components
```typescript
<button className="bg-brand-primary hover:bg-brand-primary-dark text-white px-4 py-2 rounded-md">
  Click Me
</button>
```

## Important Reminders

1. **Always use Supabase** for data persistence
2. **Never use purple/indigo/violet** colors unless requested
3. **Always use Lucide React** for icons
4. **Follow the design system** in DESIGN_TOKENS.md
5. **Keep files manageable** - split when necessary
6. **Remove unused code** - don't leave deprecated files
7. **Run build** before completing tasks
8. **No proactive documentation** - only when requested
9. **Production-ready designs** - beautiful, not cookie-cutter
10. **TypeScript strict mode** - proper typing always

---

**Last Updated**: 2025-10-28
**Project Type**: React + TypeScript + Vite + Supabase
**Purpose**: Maritime Emission Schemes Visualization Platform
