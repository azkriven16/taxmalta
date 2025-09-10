"use client";
import { PropsWithChildren, useEffect, useState } from "react";
import Noise from "./ui/noise";
import { Toaster } from "./ui/sonner";
import { ThemeProvider } from "next-themes";
import { ScrollProgress } from "./ui/scroll-progress";

export const Providers = ({ children }: PropsWithChildren) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Noise
          patternSize={250}
          patternScaleX={1}
          patternScaleY={1}
          patternRefreshInterval={2}
          patternAlpha={15}
        />
        <ScrollProgress />
        <Toaster />
      </ThemeProvider>
    </>
  );
};
