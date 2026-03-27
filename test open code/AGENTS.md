# AGENTS.md — Guidelines for AI Coding Agents

## Project Overview

Next.js application with React, TypeScript, and npm as the package manager.

## Build / Lint / Test Commands

```bash
# Install dependencies
npm install

# Run dev server (default: http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint (ESLint)
npm run lint

# Format (Prettier, if configured)
npm run format

# Run all tests
npm test

# Run a single test file
npx jest path/to/test.test.ts

# Run tests matching a name pattern
npx jest -t "test name pattern"

# Type checking (no emit)
npx tsc --noEmit
```

## Code Style

### Imports

- Use `import` syntax, never `require`.
- Order: (1) React/Next.js, (2) external libraries, (3) internal modules (`@/` alias), (4) relative imports.
- Use blank lines between import groups.
- Prefer named exports over default exports for components and utilities.

```ts
import { useState, useEffect } from "react";
import type { Metadata } from "next";

import { clsx } from "clsx";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

### Formatting

- 2-space indentation.
- Max line length: 100 characters (or follow Prettier defaults if configured).
- Use Prettier for formatting. Do not manually format if Prettier is configured.
- Always use semicolons.
- Use double quotes for JSX attributes, single quotes elsewhere (or follow Prettier config).

### Types

- Always use TypeScript. Never use `any` — use `unknown` and narrow instead.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- Use `as const` for literal types.
- Avoid type assertions (`as Type`) unless absolutely necessary.
- Export types alongside their implementations.

```ts
// Good
interface UserProps {
  name: string;
  age: number;
}

// Avoid
const data = response as UserData;
```

### Naming Conventions

- Components: `PascalCase` (e.g., `UserProfile`, `NavBar`).
- Files: components → `PascalCase.tsx`, utilities → `camelCase.ts`, kebab-case for non-component files.
- Hooks: `use` prefix, `camelCase` (e.g., `useAuth`, `useDebounce`).
- Constants: `UPPER_SNAKE_CASE` for true constants.
- Test files: `*.test.ts` or `*.spec.ts`, co-located with source.
- API routes: `app/api/[resource]/route.ts`.

### Components

- Use functional components with hooks exclusively.
- Keep components small and focused — extract when exceeding ~100 lines.
- Co-locate related files: `ComponentName/ComponentName.tsx`, `ComponentName/index.ts`.
- Use Next.js App Router conventions (`app/` directory, `layout.tsx`, `page.tsx`).

### Error Handling

- Use try/catch for async operations. Always log errors with context.
- For API routes, return proper HTTP status codes and JSON error bodies.
- Use Next.js `error.tsx` boundary files for route-level error handling.
- Never swallow errors silently.

```ts
try {
  const data = await fetchData();
} catch (error) {
  console.error("Failed to fetch data:", error);
  throw error;
}
```

### State Management

- Prefer React Context or Zustand for global state. Avoid Redux unless already in use.
- Use `useState` for local state, `useReducer` for complex local state.
- Server components by default; add `"use client"` only when needed.

### Styling

- Use Tailwind CSS classes. Avoid inline styles.
- Use `cn()` / `clsx` for conditional class merging.
- Keep responsive classes in order: `base → sm → md → lg → xl`.

### Environment & Config

- Use `.env.local` for secrets (never commit).
- Access env vars via `process.env` (server) or `NEXT_PUBLIC_` prefix (client).
- Never hardcode secrets or API keys in source code.

## Conventions for Agents

- Read existing files before modifying them to understand conventions.
- Run `npm run lint` and `npx tsc --noEmit` after making changes.
- Do not add comments unless explicitly asked.
- Keep changes minimal and focused on the task.
- Prefer editing existing files over creating new ones.
