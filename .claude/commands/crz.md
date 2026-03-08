# Astro Crumple Zone Implementation

Build healthy Astro applications with Crumple Zone Architecture. Trust the browser, design for failure modes, minimize framework dependency.

Prerequisite: Astro 5+ with `output: 'server'`. This architecture requires server-side rendering for middleware, API routes, and data fetching in frontmatter.

## Priorities

When concerns conflict, choose in this order:

1. Correctness > Experience
   * Data integrity and security are not traded for smoother interactions
2. Recoverability > Continuity
   * Ability to reconstruct state from canonical sources over never losing state
3. Visibility > Abstraction
   * Layer boundaries visible in code structure over boundaries hidden by framework
4. Simplicity > Richness
   * Fewer layers and less code over more features and interactivity

## Reliability Layers

1. HTML / Browser APIs
   * Never breaks. Use as foundation. Semantic correctness (`<button>`, not `<div onclick>`) is the precondition
2. CSS
   * Breaks visually only. No functional impact
3. Stateless island (props only)
   * Safe if inputs are correct. Guarantee inputs server-side
4. Stateful island (local state)
   * Highest risk. Minimize this layer

Rule: always ask "what happens if this breaks?" and implement in the safest possible layer.

## Component Decisions

Use Astro (.astro) by default:

* Data display (tables, cards, lists)
* Navigation, layout, conditional rendering

Use islands only when local state is required:

* Forms with validation or dynamic fields
* Dialogs with open/close state
* Real-time calculations (price, filtering)
* Browser-native APIs (Geolocation, Web Speech)

Submit-only forms use `<form>` + `FormData` — no island needed.

Client directives:

* `client:idle` — default for most islands
* `client:load` — only for immediately interactive elements
* `client:visible` — for below-the-fold content

Decision test: does the component declare local state? (useState / ref() / $state)

* No → Astro component
* Yes → Island. Group values that change together (e.g., form fields) into a single state object. Keep independently changing values as separate declarations. If the island holds too many concerns, split into stateless children

## Pages and Data

* Fetch all data in `.astro` frontmatter (server-side). Never fetch in islands
* Pass only rendering data as props. Never pass auth tokens, API keys, or session data
* Use `Astro.locals` (set by middleware) for auth/role data

```astro
---
const role = Astro.locals.role;
if (!role) return Astro.redirect("/login");
const items = await getItems();
---
<Layout>
  <ItemTable items={items} />
  <EditForm client:idle initialData={items[0]} />
</Layout>
```

## State Placement

Canonical sources (same value on every read):

| State              | Where                          | Why                                                 |
| ------------------ | ------------------------------ | --------------------------------------------------- |
| Auth / session     | HttpOnly Cookie                | Server-readable, hidden from JS                     |
| Current page       | URL path                       | Browser-managed                                     |
| Filters/pagination | URL query params               | Bookmarkable, shareable                             |
| In-progress data   | sessionStorage                 | Per-tab, survives navigation                        |
| User preferences   | HttpOnly Cookie / localStorage | Cookie if server reads; localStorage if client-only |

Transient state (lost on reload):

* Form input needing validation/dynamic display → component local state (controlled component)

A controlled component moves value from HTML to framework — higher to lower reliability. Only when validation or dynamic behavior requires it. Otherwise use `<form>` + `FormData`.

Never use:

* Global state libraries (Redux, Zustand, Jotai, Pinia, Vuex, Svelte stores)
* Cross-island state sharing (Context, provide/inject)
* localStorage for auth/session

## Mutation Pattern

Server handles correctness, client provides feedback as a crumple zone.

Use Astro Actions (`astro:actions`) as the default mutation mechanism. Actions provide type-safe server functions with built-in Zod validation.

```typescript
// src/actions/index.ts
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const server = {
  createItem: defineAction({
    accept: "form",
    input: z.object({ name: z.string().min(1) }),
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED" });
      return await saveItem(input, user);
    },
  }),
};
```

Implementation by layer:

* `<form action>` — HTML layer. Progressive enhancement via `action={actions.createItem}`. Works without JS
* Island — call `actions.createItem()` with interactive feedback (disable button, show progress). Use when validation or submitting UI is needed

Client feedback (crumple zone):

1. Submission starts → disable button, show progress
2. Success → reload or navigate (state reconstructed from canonical sources)
3. Failure → re-enable button, show error

If feedback breaks, the action still completes or fails correctly on the server.

Fall back to manual API routes (`pages/api/`) only when Actions do not fit (e.g., streaming responses, webhook endpoints).

## Security Boundary

The Astro server is a BFF — trust boundary between browser and backend.

Required:

* Auth cookies: `HttpOnly` + `SameSite=Lax` + `Secure`
* Middleware checks auth on every request
* External API calls only in `.astro` frontmatter or API routes
* Validate all API route inputs with Zod

Forbidden:

* Islands fetching external APIs directly
* Secrets in `PUBLIC_` env vars
* Auth tokens or API keys as island props
* Auth data via `document.cookie`

Browser-native APIs (Geolocation, Chrome AI, Web Speech) belong to the HTML/Browser API layer. Browser choice is the user's responsibility.

Middleware:

```typescript
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const session = context.cookies.get("session")?.value;
  context.locals.user = session ? await resolveUser(session) : null;

  // API routes check context.locals.user and return HTTP status directly.
  // No redirect — they validate their own input (Zod).
  if (context.url.pathname.startsWith("/api/")) return next();

  if (!session && !isPublicPath(context.url.pathname)) {
    return context.redirect("/login");
  }

  return next();
});
```

## ViewTransition

Crumple zone — if it breaks, the page still loads.

```astro
---
import { ClientRouter } from "astro:transitions";
---
<head>
  <ClientRouter />
</head>
<body>
  <Header transition:animate="none" />
  <Sidebar transition:animate="none" />
  <main transition:animate="fade">
    <slot />
  </main>
</body>
```

* Persistent elements: `transition:animate="none"`
* Content area: `transition:animate="fade"` only
* Use `astro:page-load` instead of `DOMContentLoaded`
* Avoid `slide` / `morph` — bitmap text stretching
* Avoid multiple `transition:name` — unintended morph on collision
* Disable for auth layout switches, non-HTML responses

## Project Structure

```
src/
  middleware.ts
  pages/
    api/                    — mutation endpoints
  features/
    {feature}/
      types.ts
      data/                 — data access
      components/           — .astro (display) + islands (interaction)
  shared/
    layout/                 — AdminLayout, UserLayout
    components/             — Pagination, Badge, etc.
    lib/                    — utilities
    types/                  — shared type definitions
  components/ui/            — UI library (shadcn/ui, etc.)
```
