import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the Terms of Service for ciptaxpro.com — your rights, responsibilities, and limitations when using our Malta and Philippines tax calculators.",
};

export default function TermsPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 pt-24 pb-20 lg:px-8 lg:pt-32">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold lg:text-4xl">Terms of Service</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Last Updated: 30 March 2026 &nbsp;|&nbsp; Effective: 30 March 2026
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">
        <p>
          Welcome to <strong>ciptaxpro.com</strong> (&quot;the Website&quot;). By
          accessing or using this Website, you agree to be bound by these Terms
          of Service. If you do not agree, please discontinue use immediately.
        </p>

        <Section title="1. Acceptance of Terms">
          <p>
            By using ciptaxpro.com, you acknowledge that you have read,
            understood, and agree to comply with these Terms, along with any
            policies referenced or linked herein.
          </p>
        </Section>

        <Section title='2. "AS IS" Disclaimer'>
          <p>
            All content, tools, calculators, and materials on this Website are
            provided &quot;as is&quot; and without any warranty of any kind. This
            includes, but is not limited to:
          </p>
          <BulletList
            items={[
              "Implied warranties of merchantability",
              "Fitness for a particular purpose",
              "Non-infringement",
              "Accuracy, completeness, timeliness, or reliability of information",
              "Freedom from errors, defects, malware, or harmful components",
            ]}
          />
          <p>You use the Website at your own risk.</p>
        </Section>

        <Section title="3. Limitation of Liability">
          <p>
            To the fullest extent permitted by law, ciptaxpro.com, its owners,
            contributors, and affiliates shall not be liable for any damages of
            any kind arising from:
          </p>
          <BulletList
            items={[
              "Use or inability to use the Website",
              "Inaccuracies or omissions in the content",
              "Interruptions or technical issues",
              "Viruses, bugs, or security breaches",
              "Loss, corruption, or disclosure of data",
            ]}
          />
          <p>
            This limitation applies regardless of legal theory (contract,
            negligence, tort, strict liability, etc.).
          </p>
        </Section>

        <Section title="4. User Responsibilities and Research Guidelines">
          <p>You agree that you are solely responsible for:</p>
          <BulletList
            items={[
              "Independently verifying any information obtained from this Website",
              "Reviewing original source links, official documents, and government publications",
              "Cross-checking figures, rates, and data before making decisions",
              "Ensuring the information is appropriate and accurate for your intended use",
              "Complying with all applicable laws, regulations, and tax rules",
              "Any consequences resulting from your reliance on the Website's content",
            ]}
          />
          <p>
            We strongly encourage users to review official government sources
            for the most current information.
          </p>
        </Section>

        <Section title="5. No Professional Advice">
          <p>
            All information on ciptaxpro.com is provided for general
            informational purposes only and is not financial, tax, or legal
            advice. For personalized guidance, you should consult a qualified
            tax professional or advisor.
          </p>
        </Section>

        <Section title="6. Source Links and External References">
          <p>
            The Website may include links to official sources, government
            agencies, or third-party references. Users are encouraged to:
          </p>
          <BulletList
            items={[
              "Review the original documents",
              "Confirm the accuracy and validity of information",
              "Check for revisions, updates, or amendments",
            ]}
          />
          <p>
            We do not guarantee the availability, reliability, or safety of
            external links.
          </p>
        </Section>

        <Section title="7. Website Availability">
          <p>We do not guarantee that ciptaxpro.com will be:</p>
          <BulletList
            items={[
              "Available at all times",
              "Free from technical issues or interruptions",
              "Compatible with your device or browser",
              "Free of errors or defects",
            ]}
          />
          <p>Service interruptions may occur without notice.</p>
        </Section>

        <Section title="8. Indemnification">
          <p>
            Users agree to indemnify and hold harmless the website operators
            from any claims, damages, losses, or expenses arising from their use
            of the website.
          </p>
        </Section>

        <Section title="9. Modifications to the Terms">
          <p>
            These terms may be modified at any time without notice. Continued
            use of the website constitutes acceptance of any modifications.
          </p>
        </Section>

        <Section title="10. Governing Law">
          <p>
            These terms are governed by the laws of the Republic of the
            Philippines without regard to conflict of law principles.
          </p>
        </Section>

        <Section title="11. Severability">
          <p>
            If any provision of these terms is found to be unenforceable, the
            remaining provisions will continue in full force and effect.
          </p>
        </Section>

        <Section title="12. Content Concerns and Takedown Requests">
          <p>
            We aim to maintain accurate and helpful information. If you believe
            content on ciptaxpro.com is:
          </p>
          <BulletList
            items={[
              "Incorrect or misleading",
              "Potentially harmful",
              "Violative of your rights",
              "Legally problematic",
              "Containing sensitive or private data",
            ]}
          />
          <p>
            Please contact us at{" "}
            <a href="mailto:ciptaxpro@gmail.com" className="underline">
              ciptaxpro@gmail.com
            </a>{" "}
            with:
          </p>
          <BulletList
            items={[
              "The specific page URL",
              "A clear explanation of your concern",
              "Any supporting documentation",
              "Your contact information",
            ]}
          />
          <p className="font-medium">Our Review Process</p>
          <BulletList
            items={[
              "We assess all legitimate requests in good faith",
              "Response times may vary",
              "Content may be updated, removed, or clarified at our discretion",
              "We reserve the right to make final editorial decisions",
              "We may decline requests that are unreasonable or unsupported",
            ]}
          />
          <p>
            Submitting knowingly false or malicious complaints may result in
            future reporting restrictions.
          </p>
        </Section>

        <Section title="13. Contact Information">
          <p>For questions or concerns regarding these Terms, please contact:</p>
          <BulletList
            items={[
              "ciptaxpro@gmail.com",
              "https://ciptaxpro.com",
            ]}
          />
          <p>We will respond to all legitimate inquiries in good faith.</p>
        </Section>

        <div className="border-t pt-6 text-center">
          <Link
            href="/privacy"
            className="text-primary text-sm underline underline-offset-4"
          >
            ← View Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
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
