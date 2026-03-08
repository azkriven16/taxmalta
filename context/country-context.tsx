"use client";

import { createContext, useContext, useState } from "react";
import type { PropsWithChildren } from "react";

export type Country = "MT" | "PH";

interface CountryContextValue {
  country: Country;
  setCountry: (c: Country) => void;
}

const CountryContext = createContext<CountryContextValue>({
  country: "MT",
  setCountry: () => {},
});

export function CountryProvider({ children }: PropsWithChildren) {
  const [country, setCountry] = useState<Country>("MT");
  return (
    <CountryContext.Provider value={{ country, setCountry }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  return useContext(CountryContext);
}
