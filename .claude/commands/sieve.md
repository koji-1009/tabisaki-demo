# Sieve — Design Implementation Strategy for Astro

Filter design requirements into the right CSS implementation. Styling lives in the CSS layer — independent of JavaScript runtime.

Prerequisite: Astro 6+. Tailwind CSS 4+ when using Tailwind patterns.

Companion skill for [Crumple Zone Architecture](https://github.com/koji-1009/crumple-zone-architecture). CRZ decides component type, state, and security. Sieve decides styling method and tokens.

## Principle

Styling belongs to the CSS layer. CSS must exist as a static asset, independent of JS execution.

| Approach                               | CSS exists without JS?           | Verdict            |
| -------------------------------------- | -------------------------------- | ------------------ |
| CSS Modules                            | Yes. Static `.css` file          | Allowed            |
| Tailwind                               | Yes. Static `.css` file at build | Allowed            |
| CSS Custom Properties                  | Yes. Native browser feature      | Foundation         |
| CSS-in-JS (styled-components, Emotion) | No. JS generates CSS at runtime  | Boundary violation |

If JS breaks, styling must survive. This is the only rule.

## Prohibited

* **CSS-in-JS** (styled-components, Emotion, etc.) — JS runtime failure removes all styles. Styling must not depend on JS execution
* **Astro scoped `<style>`** — only applies to `.astro` templates. Styles do not penetrate into islands (React, Vue, Svelte). Projects with islands cannot use scoped styles as their sole styling method, and mixing with another method violates the single-method rule. Use CSS Modules or Tailwind instead
* **`@apply`** — extracts utility classes back into CSS, a round trip that solves nothing. In Tailwind v4, `@theme` values are CSS Custom Properties; use `var()` directly in custom CSS, or extract repeated patterns into Astro components. `@apply` is an unnecessary indirection layer that creates shared style definitions — changing one definition affects all referencing components
* **Mixing methods** — use one styling method per project. CSS Modules and Tailwind in the same project creates ambiguity for both humans and AI agents. Choose one and commit

## Design Tokens

All design tokens are expressed as CSS Custom Properties. This is the universal foundation regardless of implementation method.

Semantic tokens are recommended. They carry design intent (`--color-primary`, `--color-foreground-muted`) and make components self-documenting. Primitive tokens (`--blue-600`, `--gray-200`) are permitted when a design system provides only primitives, or when project scale does not justify the semantic layer.

For Tailwind v4 projects, tokens are defined via `@theme` in the CSS entry point. Values declared in `@theme` are compiled to `:root` CSS Custom Properties and simultaneously generate utility classes. The entry point serves as both the Tailwind import and the token definition:

```css
/* src/styles/app.css — Tailwind entry point + token definition */
@import "tailwindcss";

@theme {
  /* Color — semantic */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-surface: #ffffff;
  --color-foreground: #111827;
  --color-foreground-muted: #6b7280;
  --color-border: #e5e7eb;
  --color-error: #dc2626;

  /* Typography */
  --font-sans: system-ui, sans-serif;
  --font-mono: ui-monospace, monospace;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;

  /* Spacing */
  --spacing: 0.25rem;

  /* Shape */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;

  /* Shadow */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

For non-Tailwind projects, define tokens as plain CSS Custom Properties. Note: Tailwind v4 uses a single `--spacing` base value and calculates sizes (`p-4` = `calc(var(--spacing) * 4)`). Non-Tailwind projects define each size explicitly (`--spacing-4: 1rem`):

```css
/* src/styles/tokens.css */
:root {
  --color-primary: #2563eb;
  --color-surface: #ffffff;
  --color-foreground: #111827;
  --color-foreground-muted: #6b7280;
  --color-border: #e5e7eb;
  --font-sans: system-ui, sans-serif;
  --text-sm: 0.875rem;
  --text-lg: 1.125rem;
  --spacing-4: 1rem;
  --radius-md: 0.375rem;
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

Token source is outside this skill's scope. Whether tokens come from Figma MCP, Style Dictionary, Tokens Studio, or manual definition is a toolchain decision.

## Decision Flow

### Choose Implementation Method

```
Are design tokens provided as CSS files, JSON/YAML, or Figma tokens?
├─ Yes → CSS Modules + CSS Custom Properties
└─ No → Tailwind
```

When using a Tailwind v4-compatible UI library (shadcn/ui, etc.), follow the Tailwind pattern with the library's theme mechanism.

### Method Characteristics

| Method                         | Token integration    | Scoping              | AI generation | When to choose                            |
| ------------------------------ | -------------------- | -------------------- | ------------- | ----------------------------------------- |
| CSS Modules + CSS Custom Props | Direct `var()` usage | File-scoped (module) | Moderate      | Design tokens provided by designer/system |
| Tailwind                       | `@theme` / CSS       | Utility classes      | High          | Default. No external token source         |

## CSS Modules Pattern

For projects with a design system or strict visual specifications.

```astro
---
// src/features/items/components/ItemCard.astro
import styles from './ItemCard.module.css';
const { item } = Astro.props;
---
<article class={styles.card}>
  <h3 class={styles.title}>{item.name}</h3>
  <p class={styles.description}>{item.description}</p>
</article>
```

```css
/* src/features/items/components/ItemCard.module.css */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
}

.title {
  font-size: var(--text-lg);
  color: var(--color-foreground);
}

.description {
  font-size: var(--text-sm);
  color: var(--color-foreground-muted);
}
```

Islands use CSS Modules the same way:

```tsx
// src/features/items/components/EditForm.tsx
import styles from './EditForm.module.css';

export function EditForm({ initialData }: Props) {
  return (
    <form className={styles.form}>
      <input className={styles.input} defaultValue={initialData.name} />
      <button className={styles.button}>Save</button>
    </form>
  );
}
```

Rules:

* Every visual value references a CSS Custom Property from tokens. If the token is not yet defined, use the direct value — do not invent token names
* One `.module.css` file per component, co-located — works in both `.astro` and island files
* State-dependent styles (hover, focus, disabled) use CSS pseudo-classes, not JS

## Tailwind Pattern

For projects prioritizing development speed or where design emerges during implementation. Uses Tailwind v4 with `@tailwindcss/vite` plugin.

```astro
---
// src/features/items/components/ItemCard.astro
const { item } = Astro.props;
---
<article class="bg-surface border border-border rounded-md p-4">
  <h3 class="text-lg text-foreground">{item.name}</h3>
  <p class="text-sm text-foreground-muted">{item.description}</p>
</article>
```

Islands use Tailwind classes directly:

```tsx
// src/features/items/components/EditForm.tsx
export function EditForm({ initialData }: Props) {
  return (
    <form className="space-y-4">
      <input className="border border-border rounded-md p-2 w-full" defaultValue={initialData.name} />
      <button className="bg-primary text-white rounded-md px-4 py-2">Save</button>
    </form>
  );
}
```

Rules:

* Define design tokens in `@theme` — this is both the token definition and the Tailwind configuration
* Token names in `@theme` directly become utility class names (`--color-surface` → `bg-surface`)
* Tailwind classes work identically in `.astro` files and islands — no boundary issues
* Extract repeated class combinations into Astro components — not `@apply`
* Use `@tailwindcss/vite` plugin for Astro projects (Vite-native)

### With UI Libraries

When using a UI library (shadcn/ui, etc.) with Tailwind:

* Verify the library supports Tailwind v4. Libraries built for v3 use incompatible configuration (`tailwind.config.js`, `@apply`) — do not adopt them
* Customize through the library's theme mechanism (CSS variables for shadcn/ui)
* Do not override library component styles from outside — customize tokens instead
* Wrap library components in Astro components to add project-specific defaults
* Library components live in `components/ui/`. Project components use them as building blocks

## Dark Mode

Dark mode is a token-level concern, not a component-level concern.

Browser-native (default):

```css
:root {
  --color-surface: #ffffff;
  --color-foreground: #111827;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: #111827;
    --color-foreground: #f9fafb;
  }
}
```

Manual toggle (when required by application):

Use a cookie to store the preference. The server reads the cookie and renders the appropriate token set. No client-side JS needed for the initial render. Use an Astro Action to set the cookie — follows CRZ's mutation pattern.

```typescript
// src/actions/index.ts
import { defineAction } from "astro:actions";
import { z } from "astro/zod";

export const server = {
  setTheme: defineAction({
    accept: "form",
    input: z.object({ theme: z.enum(["light", "dark"]) }),
    handler: async (input, context) => {
      context.cookies.set("theme", input.theme, { path: "/" });
    },
  }),
};
```

```astro
---
// Layout.astro
const theme = Astro.cookies.get("theme")?.value ?? "light";
---
<html data-theme={theme}>
  <slot />
</html>
```

```astro
---
// ThemeToggle.astro
import { actions } from "astro:actions";
const current = Astro.cookies.get("theme")?.value ?? "light";
---
<form action={actions.setTheme}>
  <input type="hidden" name="theme" value={current === "light" ? "dark" : "light"} />
  <button>{current === "light" ? "Dark" : "Light"}</button>
</form>
```

```css
:root, [data-theme="light"] {
  --color-surface: #ffffff;
  --color-foreground: #111827;
}

[data-theme="dark"] {
  --color-surface: #111827;
  --color-foreground: #f9fafb;
}
```

Rules:

* Components reference tokens. They do not know whether dark mode is active
* Prefer `prefers-color-scheme` — browser-native, zero JS
* Manual toggle uses a cookie (server-readable) — not JS-managed component state
* Never toggle dark mode by setting CSS Custom Property values in JS. Exception: transient preview before server-side persistence (e.g., showing the user what dark mode looks like before saving the cookie) is acceptable

## Responsive Design

Responsive design is CSS-native. No JS breakpoint detection.

* Use CSS media queries or container queries
* Tailwind: use responsive prefixes (`md:`, `lg:`) and container query prefixes (`@sm:`, `@lg:`)
* CSS Modules: use `@media` and `@container` blocks within module files
* Do not use `window.matchMedia()` in islands to control layout
* Tailwind v4 supports container queries natively — no plugin needed

## Directory Structure

Aligned with CRZ's project structure:

```
src/
  styles/
    app.css                 — Tailwind entry point + @theme tokens (Tailwind projects)
    tokens.css              — Design tokens as CSS Custom Properties (non-Tailwind projects)
    global.css              — Reset, base typography, global styles
  features/
    {feature}/
      components/
        Component.module.css  — Co-located (CSS Modules projects only)
  components/ui/             — UI library components (UI library projects only)
```

## Relationship to CRZ

| Concern           | CRZ decides                       | Sieve decides                     |
| ----------------- | --------------------------------- | --------------------------------- |
| Component type    | .astro or island                  | —                                 |
| State placement   | URL, Cookie, sessionStorage, etc. | —                                 |
| Security boundary | Server vs. client                 | —                                 |
| Token definition  | —                                 | CSS Custom Properties / @theme    |
| Styling method    | —                                 | CSS Modules / Tailwind            |
| Visual theming    | —                                 | Token switching (dark mode, etc.) |
| Responsive        | —                                 | CSS media/container queries       |

CSS is CRZ layer 2 (visual-only failure). Styling must not depend on layer 3-4 (JS).
