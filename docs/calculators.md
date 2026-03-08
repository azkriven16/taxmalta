# Calculators Reference

## Existing Calculators

| Route | Description |
|---|---|
| `audit-exemption` | Malta audit exemption eligibility |
| `late-penalty` | Late filing penalties + interest (IRD rules) |
| `notice-period` | Employment notice period |
| `personal-tax/with-dependants` | Personal income tax (with dependants) |
| `personal-tax/without-dependants` | Personal income tax (no dependants) |
| `rental-income` | Rental income tax |
| `salary-withholding` | FS5 / withholding tax validation |

## Late Penalty Logic (`lib/calcPenalty.ts`)

Key business rules:
- Filing penalty applies per month late (capped at max — €500 individual).
- Interest on outstanding tax: period-based rates.
  - Before 2022-06-01: **0.33%/month**
  - From 2022-06-01: **0.60%/month**
- Due date derived from financial year-end month.
- Payment date must be >= due date (validation error otherwise).

## Adding a Calculator

See [dev-flow.md](dev-flow.md) for the full checklist.

### Minimal page.tsx template

```tsx
import { Metadata } from "next";
import { MyCalculator } from "./_components/my-calculator";

export const metadata: Metadata = {
  title: "My Calculator",
  description: "What this calculator does.",
};

export default function Page() {
  return <MyCalculator />;
}
```

### Minimal client component template

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const schema = z.object({
  // define fields here
});

type FormValues = z.infer<typeof schema>;

export function MyCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { /* ... */ },
  });

  function onSubmit(values: FormValues) {
    // call pure lib function
    setResult(/* calculated value */);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* FormField items */}
        <Button type="submit">Calculate</Button>
      </form>
      {result !== null && <p>Result: {result}</p>}
    </Form>
  );
}
```
