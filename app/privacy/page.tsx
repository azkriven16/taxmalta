import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how CipTaxPro collects, uses, and protects your information in accordance with the Philippine Data Privacy Act of 2012 (RA 10173).",
};

export default function PrivacyPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 pt-24 pb-20 lg:px-8 lg:pt-32">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold lg:text-4xl">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Last Updated: 30 March 2026 &nbsp;|&nbsp; Effective: 30 March 2026
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">
        <p>
          Your privacy is important to us. This Privacy Policy explains how{" "}
          <strong>ciptaxpro.com</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses, and
          protects your information when you use our website. This policy is
          designed in accordance with the{" "}
          <strong>Philippine Data Privacy Act of 2012 (RA 10173)</strong> and
          applies to all visitors and users of ciptaxpro.com.
        </p>

        {/* Summary */}
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950">
          <p className="mb-3 font-semibold text-green-900 dark:text-green-100">
            Summary at a Glance
          </p>
          <ul className="space-y-1 text-green-800 dark:text-green-200">
            {[
              "No storage of tax or financial inputs",
              "Encrypted HTTPS connection",
              "Minimal data collection (analytics only)",
              "No selling or sharing of personal data",
              "Optional donations via BuyMeACoffee",
              "Full rights under the Philippine DPA",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600 dark:text-green-400">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Section title="1. Introduction">
          <p>
            At ciptaxpro.com, we are committed to safeguarding your privacy and
            ensuring transparency in how your information is handled. This
            Privacy Policy outlines what data we collect, how we use it, and
            the rights available to you under Philippine law.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <SubSection title="2.1 Automatically Collected Data (Analytics)">
            <p>
              When you visit our website, certain technical information is
              automatically collected through privacy-focused analytics tools
              (e.g., Google Analytics):
            </p>
            <BulletList items={[
              "Anonymized IP address",
              "Browser type and version",
              "Device type (mobile, desktop, tablet)",
              "Operating system",
              "Pages viewed and time spent",
              "General geographic region (country-level)",
              "Referring website or URL",
            ]} />
            <p>All analytics data is aggregated and anonymized.</p>
          </SubSection>

          <SubSection title="2.2 Calculator Inputs (Tax & Financial Data)">
            <p className="font-medium">
              ✓ We do NOT store any of the information you enter in our tax
              calculators.
            </p>
            <p>All computations are performed either:</p>
            <BulletList items={[
              "Client-side (directly in your browser), or",
              "Server-side in a stateless manner with no retention of inputs",
            ]} />
            <p>
              Your salary, deductions, tax details, or financial numbers are
              never saved, logged, or transmitted beyond what is required to
              compute your result.
            </p>
          </SubSection>

          <SubSection title="2.3 Information We DO NOT Collect">
            <p>We do not ask for or store:</p>
            <BulletList items={[
              "Full names (unless you contact us or donate)",
              "Birthdates",
              "Identifying numbers (TIN, government IDs, etc.)",
              "Emails (unless you contact us or donate)",
              "Banking or payment information",
              "Tax returns or supporting documents",
              "Employer details",
              "Precise geolocation",
            ]} />
            <p>
              We deliberately minimize data collection to ensure your privacy.
            </p>
          </SubSection>

          <SubSection title="2.4 When You Contact Us">
            <p>
              If you reach out via email (ciptaxpro@gmail.com), we may receive:
            </p>
            <BulletList items={[
              "Your email address",
              "Your name (if provided)",
              "The content of your message",
            ]} />
            <p>
              This information is used solely to respond to your inquiry.
            </p>
          </SubSection>

          <SubSection title="2.5 Donations via BuyMeACoffee">
            <p>
              We use BuyMeACoffee.com as an optional third-party platform for
              users who wish to support the website. If you choose to donate,
              BuyMeACoffee may collect:
            </p>
            <BulletList items={[
              "Your name (optional)",
              "Email address (optional)",
              "Payment information (processed securely by their payment providers)",
            ]} />
            <BulletList items={[
              "We do not receive or store your payment details (credit card, bank info, etc.).",
              "Any personal information provided during a donation is processed directly by BuyMeACoffee.com under their own Privacy Policy.",
              "Donation is 100% voluntary and not required to use the website.",
            ]} />
            <p>
              <a
                href="https://www.buymeacoffee.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                BuyMeACoffee Privacy Policy
              </a>
            </p>
          </SubSection>
        </Section>

        <Section title="3. How We Use Information">
          <p>We use the minimal data we collect for:</p>
          <BulletList items={[
            "Improving website performance",
            "Enhancing user experience",
            "Understanding which calculators are most used",
            "Diagnosing technical issues",
            "Protecting the site from security threats",
          ]} />
          <p>We do not use data for:</p>
          <BulletList items={[
            "Advertising",
            "Profiling",
            "Selling or renting to third parties",
          ]} />
        </Section>

        <Section title="4. Cookies & Tracking">
          <p>Our website may use:</p>
          <BulletList items={[
            "Essential Cookies — Required for core functionality (e.g., preferences, basic loading).",
            "Analytics Cookies — Used for anonymized website traffic analysis only.",
            "Disable Cookies — You may disable cookies in your browser settings; some features may be affected.",
          ]} />
        </Section>

        <Section title="5. Third-Party Services">
          <p>We may use the following services to operate ciptaxpro.com:</p>
          <BulletList items={[
            "Website Hosting — Reputable hosting provider (e.g., Vercel or equivalent).",
            "Analytics Tools — Used only for anonymized traffic analysis.",
            "BuyMeACoffee.com — Optional donation platform that handles its own data under its privacy policy. No tax calculator inputs are shared with them.",
          ]} />
        </Section>

        <Section title="6. Data Security">
          <p>We implement industry-standard safeguards:</p>
          <BulletList items={[
            "HTTPS / TLS encryption",
            "No storage of sensitive calculator inputs",
            "Secure hosting environment",
            "Regular security updates",
          ]} />
          <p>
            While no system is 100% risk-free, we apply appropriate measures to
            protect your data.
          </p>
        </Section>

        <Section title="7. Your Rights Under Philippine Law (RA 10173 – Data Privacy Act)">
          <p>You have the right to:</p>
          <BulletList items={[
            "Access – Request any personal data we may hold",
            "Correction – Fix inaccurate information",
            "Deletion – Request deletion (if applicable)",
            "Object – Opt out of analytics cookies",
            "File a Complaint – With the National Privacy Commission",
          ]} />
          <p>
            Contact us at{" "}
            <a href="mailto:ciptaxpro@gmail.com" className="underline">
              ciptaxpro@gmail.com
            </a>{" "}
            to exercise your rights.
          </p>
        </Section>

        <Section title="8. Data Retention">
          <BulletList items={[
            "Calculator inputs: Not stored",
            "Analytics data: Retained per analytics provider policies",
            "Emails: Kept only as long as needed",
            "BuyMeACoffee donation info: Stored only by BuyMeACoffee, not by us",
          ]} />
        </Section>

        <Section title="9. International Transfers">
          <p>
            Some service providers (e.g., hosting, analytics, BuyMeACoffee)
            may operate outside the Philippines. We ensure appropriate
            safeguards in compliance with RA 10173.
          </p>
        </Section>

        <Section title="10. Changes to This Privacy Policy">
          <p>
            We may update this policy from time to time. Continued use of the
            site constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>For privacy concerns or requests:</p>
          <BulletList items={[
            "ciptaxpro@gmail.com",
            "https://ciptaxpro.com",
          ]} />
          <p>We will respond to all legitimate inquiries in good faith.</p>
        </Section>

        <div className="border-t pt-6 text-center">
          <Link href="/terms" className="text-primary text-sm underline underline-offset-4">
            View Terms of Service →
          </Link>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 pt-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1 pl-4">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="text-muted-foreground mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current" />
          {item}
        </li>
      ))}
    </ul>
  );
}
