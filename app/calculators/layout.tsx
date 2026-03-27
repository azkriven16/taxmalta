import { DisclaimerSection } from "@/components/sections/disclaimer-section";
import React from "react";

export default function CalculatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <div className="container mx-auto px-4 pb-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <DisclaimerSection />
        </div>
      </div>
    </>
  );
}
