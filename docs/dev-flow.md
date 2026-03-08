# Development Flow

Follow this order when building or modifying a calculator or feature.

## New Calculator Checklist

1. **Read an existing calculator first** — e.g. `app/calculators/late-penalty/`
2. **Define Zod schema** — schema drives types, validation, and form defaults
3. **Implement pure logic in `lib/`** — no React, no side effects, easily testable
4. **Build the page:**
   - `app/calculators/<slug>/page.tsx` — exports `metadata`, renders client component
   - `app/calculators/<slug>/_components/<slug>.tsx` — `"use client"`, wires form → logic → result
5. **Wire form** — React Hook Form + `zodResolver` + shadcn/ui Form components
6. **Test against `tasks.txt`** — run edge cases manually
7. **Register in navbar** — `components/navbar.tsx`
8. **Register on home** — `components/sections/calculators-section.tsx`

## Bug Fix Flow

1. Read the affected file(s) before touching anything.
2. Identify root cause — don't patch symptoms.
3. Check `tasks.txt` for relevant test cases.
4. Fix, then verify the fix doesn't break adjacent cases.

## General Rules

- Never add features beyond what was asked.
- Don't add error handling for scenarios that can't happen.
- Don't create helpers for one-time operations.
- Prefer editing existing files over creating new ones.
- Keep components focused: form UI in `_components/`, business logic in `lib/`.
