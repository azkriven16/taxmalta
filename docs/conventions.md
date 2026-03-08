# Conventions

## TypeScript

- Strict mode — no `any`.
- Derive form types from Zod: `type FormValues = z.infer<typeof schema>`.
- Use `z` from `zod` v4 (`import { z } from "zod"`).

## Styling

- Tailwind CSS v4 utility classes only.
- Use `cn()` from `lib/utils.ts` for conditional/merged class names.
- Use semantic color tokens (no hardcoded hex/rgb). Supports dark/light via `next-themes`.
- Animations: Framer Motion (`framer-motion`) is available.

## Components

- shadcn/ui components live in `components/ui/` — do not hand-edit them.
- Add new shadcn components: `npx shadcn@latest add <component>`.
- Page-level client components go in `_components/` co-located with their route.
- Shared UI sections go in `components/sections/`.

## Forms

- Always use React Hook Form + Zod resolver.
- Use shadcn/ui `Form`, `FormField`, `FormItem`, `FormLabel`, `FormMessage` primitives.
- `CurrencyInput` component is available at `components/ui/currency-input.tsx`.

## Calculations

- All calculations run **client-side only** — no API routes, no server calls.
- Business logic goes in `lib/` as pure functions (no React imports).
- Use `formatCurrency()` from `lib/utils.ts` for all EUR display values.

## File naming

- Routes: short kebab-case, no redundant `-calculator` suffix (`late-penalty`, `rental-income`)
- Nested variants use a parent folder (`personal-tax/with-dependants`, `personal-tax/without-dependants`)
- Components: kebab-case filenames matching the original calculator name (`late-tax-penalty-calculator.tsx`)
- Lib functions: camelCase (`calcPenalty.ts`)

## Metadata

- Every calculator page exports a `Metadata` object with `title` and `description`.
- Title format: `"Calculator Name"` (root layout appends ` | CipTaxPro`).
