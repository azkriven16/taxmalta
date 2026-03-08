# Project Overview

**Name:** CipTaxPro (package: taxelerate)
**Purpose:** Free Malta tax & compliance calculators — all in-browser, no backend, no auth.
**URL:** https://www.ciptaxpro.com

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| UI | React 19, shadcn/ui, Radix UI |
| Styling | Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion |
| Package manager | pnpm |
| Language | TypeScript (strict) |

## Project Structure

```
app/
  layout.tsx                     # Root layout (Providers, NavbarDemo)
  page.tsx                       # Home page
  (home)/                        # Home route group
  calculators/
    <calculator-slug>/
      page.tsx                   # Route page — exports metadata
      _components/
        <calculator-slug>.tsx    # "use client" calculator component

components/
  ui/                            # shadcn/ui primitives (do not hand-edit)
  sections/                      # Landing page sections
  navbar.tsx / footer.tsx / providers.tsx

lib/
  utils.ts                       # cn(), formatCurrency()
  calcPenalty.ts                 # Malta late tax penalty business logic

config/                          # App-level constants
hooks/                           # Custom React hooks
public/                          # Static assets
docs/                            # Project documentation (this folder)
.claude/                         # Local Claude project settings
.agents/                         # Local agent configs
```

## Commands

```bash
pnpm dev        # dev server with Turbopack
pnpm build      # production build
pnpm lint       # ESLint
```

> Always use **pnpm**. Never npm or yarn.

## Malta Tax Domain Notes

- All calculators are Malta-specific (IRD rules, EUR currency).
- Interest rate for late payment changed on **2022-06-01**: 0.33% → 0.6% per month.
- Tax year filing due dates depend on the financial year-end month.
- Edge-case test scenarios are in [`tasks.txt`](../tasks.txt).
