"use client";

import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  Navbar,
  NavbarLogo,
  NavBody,
  NavItems,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { ModeToggle } from "./theme-toggle";
import Image from "next/image";
import Link from "next/link";
import { useCountry, type Country } from "@/context/country-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", link: "/" },
  { name: "Calculators", link: "/calculators" },
  { name: "Contact", link: "/contact" },
];

const countries: { code: Country; flag: string; label: string }[] = [
  { code: "MT", flag: "🇲🇹", label: "Malta" },
  { code: "PH", flag: "🇵🇭", label: "Philippines" },
];

function CountryDropdown({ className }: { className?: string }) {
  const { country, setCountry } = useCountry();
  const current = countries.find((c) => c.code === country)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-muted",
          className,
        )}
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[200] min-w-36">
        {countries.map(({ code, flag, label }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setCountry(code)}
            className="flex items-center gap-2"
          >
            <span className="text-base">{flag}</span>
            <span>{label}</span>
            {country === code && (
              <Check className="ml-auto h-3.5 w-3.5 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NavbarDemo() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Navbar className="fixed top-0 z-50 lg:top-5">
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="relative z-10 flex items-center gap-4">
          <CountryDropdown />
          <Link
            href="https://buymeacoffee.com/ciptaxpro"
            target="_blank"
            rel="noopener noreferrer"
            className="z-10 transition-transform hover:scale-105"
          >
            <Image
              src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
              alt="Buy Me A Coffee"
              width={142}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <ModeToggle />
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <div className="flex items-center gap-2">
            <CountryDropdown />
            <Link
              href="https://buymeacoffee.com/ciptaxpro"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                alt="Buy Me A Coffee"
                width={142}
                height={40}
                className="h-7 w-auto"
              />
            </Link>
            <ModeToggle />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <Link
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-neutral-600 dark:text-neutral-300"
            >
              <span className="block">{item.name}</span>
            </Link>
          ))}
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
