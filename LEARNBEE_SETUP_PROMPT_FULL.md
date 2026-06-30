# Learnbee — Full-Parity Setup Prompt (for Claude Code)

> **How to use this file (non-technical):**
> 1. Create a new **empty folder** for the Learnbee website (e.g. `Learnbee_website`).
> 2. Copy **this file** into that empty folder (rename to `SETUP.md` if you like — the name doesn't matter).
> 3. Open the folder in Claude Code (or Cursor) and paste:
>    **"Read SETUP.md in this folder and do everything it says, step by step. Stop and show me the output if any command fails."**
> 4. You don't type any commands — Claude Code runs them. If something errors, it shows you the message; reply "continue" or paste the question back.
>
> **What this version does:** installs **every library the Bsharp Converse website currently uses** — full parity. This is the "heavy" setup. Many libraries (email, database, redis, blob storage) need external accounts/API keys before their *features* work, but they will all install fine and the site will run without them.

---

## ROLE & GOAL (read this first, Claude)

You are setting up a **brand-new Next.js marketing website** for **Learnbee**, from an **empty folder**, for a **non-technical user**. Install everything, create every config file, and verify the dev server runs and the homepage renders before reporting "done."

This project must match the **exact tech stack and full dependency list** of the sibling project (Bsharp Converse): **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 (CSS-first, no JS config) + framer-motion + Geist fonts**, plus its complete library set (shadcn/Radix, tiptap editor, recharts, three.js, tsparticles, content pipeline, and backend SDKs). Use the **pinned versions below** — they are copied from Bsharp's `package.json`.

**Work autonomously.** Run the commands. Only stop if a command genuinely fails, or before anything destructive.

---

## STEP-BY-STEP SETUP

### Step 0 — Sanity checks
1. Run `node -v` and `npm -v`. Confirm Node is **>= 20.9.0**. If older, stop and tell the user to install Node 20 LTS from https://nodejs.org.
2. Confirm the folder is **empty** (only this setup file). List the directory to verify.

### Step 1 — Create `package.json` (FULL Bsharp dependency set)
Create `package.json` in the project root with this exact content. This is the complete Bsharp library list, with the `name` changed to `learnbee-website` and the blog-pipeline scripts removed (they reference Bsharp-specific script files that don't exist in a fresh project — see the note after this block).

```json
{
  "name": "learnbee-website",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=20.9.0"
  },
  "scripts": {
    "dev": "next dev --webpack",
    "dev:turbo": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@floating-ui/dom": "^1.7.6",
    "@neondatabase/serverless": "^1.0.2",
    "@paper-design/shaders-react": "^0.0.76",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-slot": "^1.2.4",
    "@react-three/drei": "^10.7.7",
    "@tailwindcss/typography": "^0.5.19",
    "@tiptap/extension-color": "^3.20.4",
    "@tiptap/extension-font-family": "^3.20.4",
    "@tiptap/extension-highlight": "^3.20.4",
    "@tiptap/extension-image": "^3.20.4",
    "@tiptap/extension-link": "^3.20.4",
    "@tiptap/extension-placeholder": "^3.20.4",
    "@tiptap/extension-table": "^3.22.0",
    "@tiptap/extension-table-cell": "^3.22.0",
    "@tiptap/extension-table-header": "^3.22.0",
    "@tiptap/extension-table-row": "^3.22.0",
    "@tiptap/extension-text-style": "^3.20.4",
    "@tiptap/extension-underline": "^3.20.4",
    "@tiptap/extension-youtube": "^3.20.4",
    "@tiptap/pm": "^3.20.4",
    "@tiptap/react": "^3.20.4",
    "@tiptap/starter-kit": "^3.20.4",
    "@tsparticles/react": "^3.0.0",
    "@tsparticles/slim": "^3.9.1",
    "@upstash/redis": "^1.37.0",
    "@vercel/blob": "^2.3.2",
    "aos": "^2.3.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "embla-carousel-auto-scroll": "^8.6.0",
    "embla-carousel-react": "^8.6.0",
    "framer-motion": "^12.36.0",
    "gray-matter": "^4.0.3",
    "lenis": "^1.3.23",
    "lucide-react": "^0.577.0",
    "mammoth": "^1.12.0",
    "next": "16.1.6",
    "radix-ui": "^1.5.0",
    "react": "19.2.3",
    "react-countup": "^6.5.3",
    "react-dom": "19.2.3",
    "react-icons": "^5.5.0",
    "react-qr-code": "^2.0.18",
    "react-use-measure": "^2.1.7",
    "recharts": "^3.8.1",
    "rehype-raw": "^7.0.0",
    "rehype-stringify": "^10.0.1",
    "remark": "^15.0.1",
    "remark-gfm": "^4.0.1",
    "remark-rehype": "^11.1.2",
    "resend": "^6.9.4",
    "shadcn": "^4.11.0",
    "tailwind-merge": "^3.6.0",
    "three": "^0.184.0",
    "tw-animate-css": "^1.4.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "19.2.17",
    "@types/react-dom": "19.2.17",
    "@types/three": "^0.184.0",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "5.9.3"
  }
}
```

> **Note on scripts:** Bsharp's `package.json` has ~15 extra `blog:*` scripts (manifest generation, frontmatter sync, image repair, etc.). Those run Bsharp-specific files under `scripts/` and a `content/` blog corpus that don't exist in a fresh Learnbee project, so they are intentionally omitted. The **libraries** that power them (`gray-matter`, `remark*`, `rehype*`, `mammoth`, `@tiptap/*`) ARE installed, so you can build the same blog/editor features later. Don't re-add the `blog:*` scripts unless you also create the matching script files.
>
> **`@types/three` added:** Bsharp's list didn't pin it but uses `three`; including the types avoids TypeScript errors. Harmless if unused.

### Step 2 — Install dependencies
Run:
```
npm install
```
React 19 is new, so if you hit peer-dependency errors, retry once with:
```
npm install --legacy-peer-deps
```
This install is large (tiptap, three.js, recharts, etc.) — it may take a few minutes. Show the user the final output.

### Step 3 — `tsconfig.json`
Create `tsconfig.json` in the project root:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "incremental": true,
    "module": "esnext",
    "esModuleInterop": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "plugins": [{ "name": "next" }]
  },
  "include": [
    "next-env.d.ts",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts",
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": ["node_modules"]
}
```

### Step 4 — `next.config.mjs`
Create `next.config.mjs` in the project root:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Add remote image hosts here as needed, e.g.:
    // remotePatterns: [{ protocol: "https", hostname: "images.example.com" }],
  },
};

export default nextConfig;
```

### Step 5 — `postcss.config.mjs`
Tailwind v4 runs as a PostCSS plugin. Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### Step 6 — `eslint.config.mjs`
Create `eslint.config.mjs`:

```js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```
> If ESLint complains about a missing `@eslint/eslintrc`, run `npm install -D @eslint/eslintrc` and retry. ESLint isn't required for the site to run — don't block setup on it.

### Step 7 — `.gitignore`
Create `.gitignore`:

```
/node_modules
/.next
/out
/build
.DS_Store
*.pem
.env*
!.env.example
npm-debug.log*
.vercel
next-env.d.ts
```

### Step 8 — `.env.example` (placeholders for the backend libraries)
Several installed libraries read environment variables. Create `.env.example` so the user knows what to fill in **later** (the site runs fine without them until you use those features):

```
# Public site URL (used by metadata)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Resend — transactional email (resend)
RESEND_API_KEY=

# Neon — serverless Postgres (@neondatabase/serverless)
DATABASE_URL=

# Upstash Redis (@upstash/redis)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Vercel Blob storage (@vercel/blob)
BLOB_READ_WRITE_TOKEN=
```
> Do NOT create a real `.env` or invent secret values. Leave them blank; the user fills these in only when they wire up email/DB/storage features.

### Step 9 — `app/globals.css` (Tailwind v4 CSS-first config)
Design tokens live here as CSS variables — **there is NO `tailwind.config.js`**. Create `app/globals.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";
@plugin "@tailwindcss/typography";
@source "../app/**/*.{js,jsx,ts,tsx,mdx}";
@source "../components/**/*.{js,jsx,ts,tsx,mdx}";

:root {
  --background: #ffffff;
  --foreground: #0f172a;

  /* Learnbee brand tokens — change these to taste */
  --brand: #5046e5;        /* primary (violet-indigo, same as Bsharp) */
  --brand-dark: #4338ca;   /* hover / pressed */
  --radius: 0.625rem;
  --secondary: #f4f4f5;
}

/* Map CSS variables into Tailwind v4's theme so utilities like
   `bg-brand`, `text-brand-dark`, `font-sans` resolve to these. */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-brand: var(--brand);
  --color-brand-dark: var(--brand-dark);
  --color-secondary: var(--secondary);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif;
}

/* House reveal animation (matches Bsharp) */
.reveal-up {
  animation: reveal-up 0.7s ease-out both;
}
@keyframes reveal-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### Step 10 — `app/layout.js` (Geist fonts)
Create `app/layout.js`:

```js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "Learnbee",
  description: "Learnbee — <one-line description of the product>.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
```

### Step 11 — `lib/utils.ts` (the `cn()` helper)
Create `lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Step 12 — Initialize shadcn/ui (the 21st.dev / Magic component path)
Bsharp builds UI from **shadcn + Radix**. Set up shadcn so you (and the 21st.dev Magic tool) can drop components in. Run:
```
npx shadcn@latest init
```
Accept the defaults when prompted (base color: choose **Neutral** or **Slate**; CSS variables: **yes**). This creates a `components.json` and may add tokens to `globals.css` — that's expected. If it asks to overwrite `globals.css` tokens, **let the user review the change** rather than blindly accepting. Then add a couple of base components to confirm it works:
```
npx shadcn@latest add button card
```
> If `shadcn init` errors on the new Tailwind v4 / React 19 combo, don't fight it — skip this step, tell the user, and proceed. shadcn components can be added later; the rest of the site doesn't depend on it.

### Step 13 — Homepage (`app/page.tsx`)
A branded landing page proving the core stack works (Tailwind + framer-motion + lucide + Geist). Create `app/page.tsx`:

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

const EASE = [0.25, 0.1, 0.25, 1] as const;

export default function Home() {
  const reduce = useReducedMotion() ?? false;

  return (
    <main className="min-h-screen bg-[--color-background] text-[--color-foreground] font-[family-name:var(--font-geist-sans)]">
      <section className="mx-auto flex max-w-[1100px] flex-col items-center px-6 pt-32 pb-24 text-center">
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[--color-brand]/25 bg-[--color-brand]/10 px-4 py-1.5"
        >
          <Sparkles className="h-4 w-4 text-[--color-brand]" />
          <span className="text-sm font-medium text-[--color-brand-dark]">
            Welcome to Learnbee
          </span>
        </motion.span>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.6, ease: EASE }}
          className="text-4xl font-bold tracking-[-0.03em] sm:text-6xl"
        >
          The full stack is ready.
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
          className="mt-5 max-w-[560px] text-base leading-relaxed text-[--color-foreground]/60"
        >
          Next.js 16, React 19, Tailwind v4, framer-motion, shadcn/Radix,
          recharts, tiptap, three.js and more are installed. Start building
          Learnbee from here.
        </motion.p>

        <motion.a
          href="#"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: EASE }}
          className="mt-9 inline-flex items-center gap-2 rounded-xl bg-[--color-brand] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[--color-brand-dark]"
        >
          Get started <ArrowRight className="h-4 w-4" />
        </motion.a>
      </section>
    </main>
  );
}
```

### Step 14 — Verify it runs
1. Type-check: `npx tsc --noEmit` (no errors expected). If `npx tsc` misbehaves on Windows, use `node ./node_modules/typescript/bin/tsc --noEmit`.
2. Start the dev server: `npm run dev`
3. Confirm it boots on **http://localhost:3000** with no compile errors. (If port 3000 is busy, Next picks another — tell the user which.)
4. Tell the user to open the URL; they should see the "The full stack is ready." landing page.
5. Report success with the final folder structure and any libraries that needed `--legacy-peer-deps` or were skipped.

---

## FULL LIBRARY MANIFEST (what got installed and why)

| Library | Purpose |
|---|---|
| `next`, `react`, `react-dom` | Framework + runtime (Next.js 16 App Router, React 19) |
| `typescript`, `@types/*` | TypeScript + type defs |
| `tailwindcss` v4, `@tailwindcss/postcss`, `@tailwindcss/typography`, `tw-animate-css` | Styling (CSS-first), prose styles, animation utilities |
| `framer-motion` | Animations (**import from `'framer-motion'`, never `'motion/react'`**) |
| `lucide-react`, `react-icons` | Icon sets |
| `clsx`, `tailwind-merge`, `class-variance-authority` | The `cn()` class helper + variant styling |
| `shadcn`, `radix-ui`, `@radix-ui/react-accordion`, `@radix-ui/react-slot`, `@floating-ui/dom` | Accessible UI components (shadcn/Radix — the 21st.dev/Magic target) |
| `embla-carousel-react`, `embla-carousel-auto-scroll` | Carousels / logo marquees |
| `lenis`, `aos`, `react-use-measure`, `react-countup` | Smooth scroll, scroll-reveal, element measuring, animated counters |
| `recharts` | Charts / data viz |
| `three`, `@react-three/drei`, `@paper-design/shaders-react`, `@tsparticles/react`, `@tsparticles/slim` | 3D / WebGL shaders / particle backgrounds |
| `react-qr-code` | QR codes |
| `@tiptap/*` | Rich-text editor (blog/content authoring) |
| `gray-matter`, `remark`, `remark-gfm`, `remark-rehype`, `rehype-raw`, `rehype-stringify`, `mammoth` | Markdown/MDX + Word-doc content pipeline |
| `zod` | Schema validation (forms, API input) |
| `resend` | Transactional email — needs `RESEND_API_KEY` |
| `@neondatabase/serverless` | Serverless Postgres — needs `DATABASE_URL` |
| `@upstash/redis` | Redis — needs `UPSTASH_REDIS_REST_*` |
| `@vercel/blob` | File/blob storage — needs `BLOB_READ_WRITE_TOKEN` |

---

## CONVENTIONS (mirror Bsharp when building Learnbee)

- **Path alias:** import from `@/...` (project root). E.g. `import { cn } from "@/lib/utils"`.
- **Tailwind v4 is CSS-first:** add design tokens as CSS variables in `app/globals.css` (`:root` + `@theme inline`). **Never create a `tailwind.config.js`.**
- **framer-motion:** import from `'framer-motion'` — never `'motion/react'`.
- **Fonts:** apply Geist via `font-[family-name:var(--font-geist-sans)]`; the layout only exposes the CSS variables.
- **Motion accessibility:** gate every animation on `useReducedMotion()`.
- **House easing:** `[0.25, 0.1, 0.25, 1]`.
- **Brand color:** `#5046e5` primary / `#4338ca` dark — change the two variables in `globals.css` if Learnbee has its own.
- **Client vs server:** add `"use client"` to any file using hooks, state, or framer-motion.
- **Components in** `components/`, helpers in `lib/`.

---

## IMPORTANT CAVEATS

- **Do NOT install `@react-three/fiber`.** In the sibling project, React-Three-Fiber's global JSX augmentation broke the build. Bsharp uses raw `three` (+ `@react-three/drei`) — keep it that way. If you need a 3D scene, write to `three` directly or check whether `drei` pulls in fiber before relying on it.
- **Backend libraries install but stay dormant** until their env vars are set (`resend`, neon, upstash, vercel blob). The site runs without them. Don't fabricate API keys.
- **Heavy install:** ~60 packages plus transitive deps. Expect a multi-minute `npm install` and a larger `node_modules`.
- **This is a standalone project** — it does not share files with Bsharp. Don't import from or reference Bsharp's paths.
- **Don't deploy or push** anywhere unless the user explicitly asks.
```

