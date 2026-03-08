"use client";
import { PropsWithChildren } from "react";
import Noise from "./ui/noise";
import { Toaster } from "./ui/sonner";
import { ThemeProvider } from "next-themes";
import { CountryProvider } from "@/context/country-context";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <CountryProvider>
        {children}
      </CountryProvider>
      <Noise
        patternSize={250}
        patternScaleX={1}
        patternScaleY={1}
        patternRefreshInterval={2}
        patternAlpha={15}
      />
      <Toaster />
    </ThemeProvider>
  );
};
