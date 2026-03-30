import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-secondary mt-20 border-t">
      <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-6 text-sm md:flex-row lg:px-8">
        <p className="text-muted-foreground text-center md:text-left">
          © 2026 CipTaxPro. All rights reserved.{" "}
          <span className="hidden sm:inline">Your tax clarity starts here.</span>
        </p>
        <div className="text-muted-foreground flex gap-4">
          <Link href="/privacy" className="hover:text-foreground underline underline-offset-4 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground underline underline-offset-4 transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};
