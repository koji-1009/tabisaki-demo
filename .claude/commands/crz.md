# Astro Crumple Zone Implementation

Build healthy Astro applications with Crumple Zone Architecture. Trust the browser, design for failure modes, minimize framework dependency.

Prerequisite: Astro 6+ with `output: 'server'`. This architecture requires server-side rendering for middleware, API routes, and data fetching in frontmatter.

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
   * Breaks visually only. No functional impact. Interactions achievable with `:hover`, `:focus`, `::after`, `:target`, or `<details>`/`<summary>` belong here — not in an island
3. Stateless island (props only)
   * Safe if inputs are correct. Guarantee inputs server-side
4. Stateful island (local state)
   * Highest risk. Minimize this layer

Rule: always ask "what happens if this breaks?" and implement in the lowest-numbered layer that accomplishes the task.

Islands in layers 3-4 should be wrapped in each framework's error boundary mechanism. If the island crashes, display a fallback UI instead of a blank space. This structurally enforces the isolation guarantee — the rest of the page remains intact.

Server-side errors: provide `pages/500.astro` for unhandled exceptions. In `---` frontmatter, catch expected errors (DB failures, external API errors) and render an error state in HTML. Action handlers throw `ActionError` with appropriate codes — the calling island or form receives the error and displays feedback.

Partial failure: when frontmatter fetches from multiple sources, catch each independently. Display successful results and show a warning banner for failed sources. Do not fail the entire page because one source is unavailable — this applies "Recoverability > Continuity" at the data level.

## Component Decisions

Use Astro (.astro) by default:

* Data display (tables, cards, lists)
* Navigation, layout, conditional rendering

Use islands only when local state is required:

* Forms with validation or dynamic fields
* Dialogs with internal state (validation, dynamic fields, multi-step)
* Real-time calculations (price, filtering)
* Browser-native APIs (Geolocation, Web Speech)

Submit-only forms use `<form>` + `FormData` — no island needed.

Client directives:

* `client:idle` — default for most islands
* `client:load` — elements the user interacts with before scrolling (search box, primary navigation toggle)
* `client:visible` — for below-the-fold content

Server Islands (`server:defer`):

Defer server rendering of auxiliary components. The page loads with fallback content; the component renders asynchronously via a separate server request.

When to use frontmatter (default):

* Page's main content — block SSR to guarantee delivery
* Auxiliary content needed immediately — use partial failure pattern on error
* Content whose absence would mislead the user

When to use `server:defer`:

* Expensive computation where the user expects loading time (analytics charts, aggregated reports)
* Personalized content on an otherwise cacheable page (user profile widget on a public page)

Fallback design: if the Server Island fails, the fallback remains silently — no error UI, no retry. Design the fallback as content meaningful on its own, not just a loading indicator.

Decision test:

1. Does it need DOM manipulation without state (dialog.showModal(), scroll-to-top, clipboard copy)?
   * Yes → `<script>` tag. Layer 1 (Browser API). No island needed
2. Does it declare local state? (useState / ref() / $state)
   * No → Astro component
   * Yes → Island. Group values that change together (e.g., form fields) into a single state object. Keep independently changing values as separate declarations. If the island's state serves more than one user interaction, split each interaction into its own island

Island verification — before writing an island, confirm each hook is necessary:

* useState holding server data → pass as props from frontmatter. No island needed
* useState for tooltip/hover display → HTML `title` attribute or CSS `:hover`. No island needed
* useState for scroll/carousel position → CSS `overflow-x: auto`. No island needed
* useState for filter/sort selection → URL query params + server-side filtering. No island needed
* useEffect fetching data → move to frontmatter. Never fetch in islands
* useEffect syncing URL → URL is canonical. Use `<a>` or `navigate()`
* useEffect for DOM manipulation without state → use `<script>` tag

If all state values are replaceable, the island is unnecessary — rewrite as `.astro` component or `<script>`.

For the fuller decision model including navigation-first evaluation, see architecture.md section 5.1.

## Pages and Data

Execution boundary: the `---` block runs on the server. The HTML below it is the output. No JavaScript reaches the browser unless explicitly added via `<script>` or an island. Do not define client-side functions in frontmatter.

* Fetch dynamic data (DB, API — changes per request) in `.astro` frontmatter. Never fetch in islands
* Static configuration may be imported directly in islands — no need to serialize through props. A module is static configuration if it requires no server-side execution (no I/O, no async, no secrets). Examples: `as const` objects, Zod schemas, enum definitions, display constants
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

| State                                                      | Where                                           | Why                                                                                    |
| ---------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| Auth / session                                             | HttpOnly Cookie                                 | Server-readable, hidden from JS                                                        |
| Current page                                               | URL path                                        | Browser-managed                                                                        |
| View state (filters, pagination, sort, search, active tab) | URL query params                                | Shareable, bookmarkable, reproducible — with or without authentication                 |
| In-progress data                                           | sessionStorage                                  | Per-tab, survives navigation                                                           |
| User preferences                                           | Server-side DB / HttpOnly Cookie / localStorage | DB if backend exists; cookie if BFF-only and server reads; localStorage if client-only |

URL vs cookie is not about authentication — it is about state type. View state (what you are looking at) always goes in the URL, even in authenticated apps. Identity state (who you are) goes in cookies. Preference state (how you want things) goes in DB or cookies. When URL params and cookie defaults overlap, URL params take precedence.

Transient state (lost on reload):

* Form input where the UI updates before submission (validation errors, dynamic fields, live preview) → component local state (controlled component)

A controlled component moves value from HTML to framework — higher to lower reliability. If the UI does not update before submission, use `<form>` + `FormData`.

Never use:

* Global state libraries (Redux, Zustand, Jotai, Pinia, Vuex, Svelte stores)
* Cross-island state sharing (Context, provide/inject)
* localStorage for auth/session

## Mutation Pattern

Server handles correctness, client provides feedback as a crumple zone.

Client-initiated mutations that accept user input requiring validation must use Astro Actions (`astro:actions`). Actions provide type-safe server functions with built-in Zod validation — the caller gets compile-time type errors if the contract is violated. Mutations without user input (logout, session clear) use `<form method="POST">` with PRG — no Action needed. Navigation without data change uses `<a>` or `navigate()` — not an Action.

```typescript
// src/actions/index.ts
import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";

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

Choose the lowest layer that meets the requirement:

1. `<form method="POST">` with PRG — pure HTML. No Action, no JS. Use when the form carries no user-authored content (logout, deletion by ID, re-processing a previous result). POST processes the request, stores results in `Astro.session` if needed, and redirects. This avoids the browser's "resubmit form?" warning on reload
2. `<form action={actions.createItem}>` — HTML + Action. Still zero JS. Use when POST accepts user input that requires type-safe Zod validation and structured error handling
3. Island calls `actions.createItem()` — JS required. Use only when the mutation requires JS to modify the DOM (disable button, show spinner, display error, update list without reload)

PRG pattern (layer 1):

```astro
---
if (Astro.request.method === "POST") {
  const formData = await Astro.request.formData();
  const result = await analyze(formData);
  await Astro.session.set("result", result);
  return Astro.redirect(Astro.url.pathname);
}
const result = await Astro.session.get("result");
---
<form method="POST">
  <input name="query" />
  <button>Analyze</button>
</form>
{result && <ResultView data={result} />}
```

Action definition:

* `accept: "form"` — for `<form>` submissions (layer 2). Prefer this
* `accept: "json"` — for programmatic calls from islands (layer 3). Use when the island constructs the payload without a form element

Client feedback (crumple zone):

1. Submission starts → disable button, show progress
2. Success → reconstruct from canonical sources:
   * `navigate(url)` (ClientRouter) — soft reload with ViewTransition, preferred when ClientRouter is active
   * `window.location.reload()` — hard reload, always works
3. Failure → re-enable button, show error

If feedback breaks, the action still completes or fails correctly on the server.

`pages/api/` is only for external consumers (webhook receivers, SSE/streaming) — not for mutations initiated by the client. Client-initiated mutations — including file uploads — use Actions (`accept: "form"` handles FormData with files) with processing logic in `features/*/data/`. Mutations without user input (logout, session clear) use PRG.

## Security Boundary

The Astro server is a BFF — trust boundary between browser and backend.

Required for all applications:

* HTTPS in production
* All cookies: `HttpOnly` + `SameSite=Lax` + `Secure`
* External API calls only in `.astro` frontmatter or API routes
* Validate all API route inputs with Zod

When authentication is required:

* Middleware checks auth on every request

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
  <Header />
  <Sidebar />
  <main>
    <slot />
  </main>
</body>
```

* Add `<ClientRouter />` to the layout. The default crossfade applies to the entire page — no further directives needed
* `transition:animate` and `transition:name` are unnecessary for the default crossfade. Specifying them generates per-component `view-transition-name` CSS, requiring individual tuning for each targeted Astro component. Omitting them avoids this overhead
* Use `astro:page-load` instead of `DOMContentLoaded`
* Never call `history.pushState()` or `history.replaceState()` in islands — ClientRouter stores navigation data in `history.state`. Overwriting it breaks browser back/forward. To update URL query params (filters, pagination), use `navigate()` from `astro:transitions/client` or `<a>` with the new query string
* Disable when the layout component changes (e.g., login → dashboard) — use `window.location.href` for hard navigation instead of `navigate()`
* Disable for non-HTML responses

## Project Structure

```
src/
  middleware.ts
  pages/
    api/                    — endpoints for external consumers only (webhook receivers, SSE/streaming)
  features/
    {feature}/
      types.ts
      data/                 — data I/O, server-only (backend boundary: swap internals without changing callers). API fetch, file processing, DB queries, storage writes. Only frontmatter and Action handlers call into data/. Islands must not import from this directory
      components/           — .astro (display) + islands (interaction)
  shared/
    layout/                 — AdminLayout, UserLayout
    components/             — project-specific shared components (Pagination, Badge). Built from ui/ primitives
    lib/                    — generic utilities only (date formatting, string helpers). Domain-specific logic belongs in features/
    types/                  — shared type definitions
  components/ui/            — third-party UI primitives (shadcn/ui, etc.). If not using a UI library, this directory is unnecessary — put primitives in shared/components/
```

## Test Strategy

Test effort follows the reliability layers:

1. Layer 1-2 (HTML/CSS, SSR output)
   * E2E tests (Playwright). Verify that server-rendered pages return correct content and structure
2. Server (Actions / data access)
   * Unit tests. Guarantee server-side correctness — validation, authorization, data mutations
3. Islands (layers 3-4)
   * Storybook for human visual/interaction review. Whether feedback is appropriate is a human judgment
   * Automated tests (Playwright, component tests) raise confidence but do not determine correctness — they verify mechanics (button disables, error shows), not UX quality

Test directory mirrors source structure:

```
tests/
  fixtures/                     — real API response samples
  features/
    {feature}/
      data/
        {module}.test.ts
  shared/
```

Test shared infrastructure (fetch wrappers, caching, rate limiting) in shared test files. Consumer tests should not re-test shared behavior — they test their own logic assuming the shared layer works.

The server is the source of correctness. Test the server thoroughly; verify islands with human eyes.

## Post-Application Review

After applying CRZ principles, review every change against these checks before finalizing:

1. **Blast radius check**
   * For each new layer or pattern introduced, answer: "What happens if this breaks?" If the answer is "nothing, because the layer below already handles it," the layer is redundant.
2. **Canonical source honesty**
   * Is the declared canonical source genuinely authoritative, or is it a derived cache being treated as one? A sessionStorage copy of server data is a cache, not a canonical source. Name the actual authority and acknowledge stopgaps as stopgaps.
3. **Dead code check**
   * Are all exported functions called? Unused initializers, sync functions, or cache hydration calls indicate an over-designed layer.
4. **Simplicity check**
   * Did the change add a layer, abstraction, or intermediate state? Is that layer actually needed, or does a simpler mechanism (SSR props, direct DOM update, existing browser API) already solve the problem? Remove any layer that exists only to satisfy a principle rather than to solve a real problem.
5. **Island necessity check**
   * For each island, list every `useState` call. Can each value be a server prop, URL query param, HTML attribute, CSS rule, or `<script>` DOM call? If yes for all values, the island should be an `.astro` component.
6. **Document consistency check**
   * Does the change add, remove, or rename a feature, route, or component? If yes, verify that CLAUDE.md, PROJECT.md, and any other project documentation reflect the current state. Deleted features must be removed from documentation.
