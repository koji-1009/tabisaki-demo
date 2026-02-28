# Agent Instructions for tabisaki-demo

## Project Context

Japanese prefecture discovery app. Users go through animated onboarding (pick theme color/tone, choose discovery path), then explore prefectures via search, guided questionnaire, or browser LLM chat.

## Key Architecture Decisions

1. **Astro SSR + React Islands** — Not an SPA. React only for interactive parts.
2. **Service layer** (`src/services/`) — All data access goes through services. Never import JSON directly in components/pages.
3. **MD3 theming** — `@material/material-color-utilities` generates design tokens. Applied as CSS custom properties.
4. **Cookie `user_prefs`** — Stores `{ color, tone, onboarded }`. Middleware uses this for routing and theme injection. Default theme generated even without cookie.
5. **Shared constants** — `ACTIVITY_IDS` / `REGION_IDS` in `src/types/index.ts` is the single source of truth. Types derived via `typeof`. Don't duplicate.
6. **ErrorBoundary** — Major page islands wrapped via `*Page.tsx` (ChatPage, DiscoverPage, SearchPage).

## Code Style

- TypeScript strict mode, no experimental features
- Biome 2.x for formatting/linting (not ESLint/Prettier)
- Relative imports only (no path aliases)
- Japanese UI text, bilingual data (name + nameEn)
- Minimal error handling — trust internal code, validate at boundaries
- IME support: Always check `e.nativeEvent.isComposing` on Enter key handlers for text inputs

## MD3 Color Role Guidelines

- **primary**: Main CTA buttons only (submit, next). User chat bubbles.
- **secondary-container**: Selection states (filter chips, activity cards, suggestion cards)
- **tertiary**: Accent/emotional actions (wishlist add, discover transition, match scores)
- **surface-container-***: Backgrounds (cards, inputs). Use graduated levels for depth.
- All interactive elements (buttons, cards) MUST explicitly set `color` with the appropriate `on-*` role — browser default button text color breaks in dark mode.
- **error**: Destructive actions (remove from list, reset)
- Never use primary for everything — differentiate roles for visual hierarchy.

## Navigation

- All navigation is in the header (`Layout.astro`): logo + さがす, 発見, 行きたい, 設定
- No footer nav — header links are pure HTML `<a>` tags (zero JS)
- Header is hidden during onboarding (`hideNav` prop)

## When Working on Components

- React components are Astro islands — use `client:load` or `client:visible` directives
- motion (formerly framer-motion) for animations — import from `motion/react`
- Use CSS custom properties (`--md-sys-color-*`) for theming, not hardcoded colors
- Mobile-first (375px+ viewport)

## When Working on Services

- Functions, not classes. Keep interfaces simple.
- Implementations read from JSON files or cookies/localStorage
- Keep the interface stable — components depend on it

## When Working on Chat

- System prompt instructs AI to output `[activities:ocean,food]` tags + 【prefecture】 names
- Chat logic split: `useAISession` hook (src/hooks/), `chat-helpers.ts` (src/utils/), `BubbleActions` component
- `extractActivities()` parses the activity tags, `extractPrefectures()` parses 【prefecture】 names only (not bare names)
- `renderMarkdown()` strips `[activities:...]` tags before display and escapes HTML before applying formatting
- Activity chips + "この条件で探す" link navigates to `/discover?activities=...`

## When Working on Data

- `src/data/prefectures.json` — All 47 prefectures
- `src/data/activities.json` — Activity categories
- Follow existing schema exactly (see `src/types/index.ts`)

## Testing

- Vitest (see `vitest.config.ts`)
- Test files in `tests/` directory (mirrors src structure)
- `@material/material-color-utilities` requires `server.deps.inline` in vitest config
- Focus on: utility functions, service layer, data integrity
