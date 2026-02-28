# tabisaki-demo

Japanese prefecture discovery app built with Astro (SSR) + React (Islands).

## Tech Stack

- **Framework**: Astro 5 (SSR mode, `output: 'server'`)
- **Interactive UI**: React 19 + motion (islands only)
- **Theming**: `@material/material-color-utilities` (MD3 dynamic theming)
- **Browser LLM**: Chrome built-in AI (Prompt API) — progressive enhancement
- **Data**: Local JSON
- **Storage**: Cookies + localStorage
- **Language**: TypeScript (strict, minimal config)
- **Linting/Formatting**: Biome 2.x (no ESLint, no Prettier)
- **Testing**: Vitest

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run check` — Biome check
- `npm run format` — Format with Biome
- `npm test` — Run tests once
- `npm run test:watch` — Watch mode tests

## Architecture Principles

- **Astro islands**: Only interactive parts ship JS. SSR for everything else.
- **Service layer**: `src/services/` abstracts data access.
- **Cookie-first session**: `user_prefs` cookie stores color/tone/onboarded.
- **Theme in SSR**: Middleware reads cookie -> generates CSS vars -> injects into HTML. Default theme generated even without cookie (ensures dark mode works on first visit). No FOUC.
- **Chrome AI as progressive enhancement**: Chat page only in Chrome with AI. Fallback to guided discovery.

## Navigation Structure

- **Header**: App logo ("たびさき") + nav links (さがす, 発見, 行きたい, 設定). Hidden during onboarding.
- **No footer nav** — all navigation is in the header (pure HTML `<a>` tags, zero JS)
- **Chat**: Accessible from discover page ("AIチャットで相談する" link), not in header nav

## Chat Flow

1. User describes travel preferences in natural language
2. AI identifies matching activities (ocean, mountains, food, temples, onsen, urban)
3. AI outputs `[activities:ocean,food]` tags + prefecture suggestions with 【】
4. UI extracts activities and shows "この条件で探す" link to `/discover?activities=...`
5. Discover page accepts `?activities=` query param for pre-selected filters

## MD3 Theme Variants

Tone picker maps to proper MD3 DynamicScheme variants (no hacks):
- **vibrant**: `SchemeVibrant` — maxes out colorfulness
- **calm**: `SchemeTonalSpot` — default Material You, balanced
- **monochrome**: `SchemeMonochrome` — fully grayscale
- **pastel**: `SchemeNeutral` — near grayscale, naturally soft/muted

## MD3 Color Roles

- **primary / on-primary**: Main CTA buttons (送信, 次へ), user chat bubbles
- **secondary-container / on-secondary-container**: Selection chips, suggestion cards, filter chips
- **tertiary / on-tertiary**: Accent actions (行きたいボタン, discover遷移リンク, マッチ度スコア)
- **surface-container-***: Card backgrounds, input fields
- **error**: Destructive actions (リストから外す, リセット)
- **Important**: All interactive elements (buttons, cards) MUST set `color` with appropriate `on-*` role — browser default button text color breaks in dark mode

## Conventions

- All UI text in Japanese
- Prefecture data has both Japanese and English names
- Animations: 200-300ms transitions (snappy for mobile)
- No CSS framework — CSS custom properties from MD3 tokens
- No path aliases — use relative imports
- Images: placeholder solid color cards with prefecture name (for now)
- IME support: Always check `isComposing` on Enter key handlers
- `ACTIVITY_IDS` / `REGION_IDS` constants in `src/types/index.ts` — single source of truth, types derived via `typeof`
- API validation (Zod) schemas derive from these shared constants — never duplicate enum values
- ErrorBoundary wraps major page islands (search, discover, chat) via `*Page.tsx` wrappers

## Deployment

- **Target**: Cloudflare Pages (SSR)
- **Adapter**: `@astrojs/cloudflare`
- **CI**: GitHub Actions (lint, test, build check)
- **Deploy**: Cloudflare Pages auto-deploy on push to main

## Known Issues

- `@material/material-color-utilities` has broken ESM exports — requires `vite.ssr.noExternal` in astro.config.mjs and `server.deps.inline` in vitest.config.ts

## Project Structure

```
src/
  middleware.ts          — Cookie check, redirect, theme injection
  layouts/Layout.astro   — Base layout with header nav + MD3 CSS vars
  pages/                 — Astro pages + API routes
  components/            — React islands (onboarding, search, chat, etc.)
  services/              — Data access layer
  data/                  — Static JSON (prefectures, activities)
  types/index.ts         — Shared TypeScript types + ACTIVITY_IDS
  utils/                 — Cookie helpers, Chrome AI wrapper, theme application
  hooks/                 — Custom React hooks (useAISession)
tests/                   — Vitest tests (mirrors src structure)
```
