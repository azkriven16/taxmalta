"use client";

import Image from "next/image";

export const FeaturesSection = () => {
  return (
    <section className="mx-auto max-w-7xl">
      <div className="container">
        <div>
          <h1 className="text-3xl font-extrabold lg:text-5xl">
            How to Use the Malta Tax Calculators
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 lg:text-lg">
            Get started with understanding and using Malta&apos;s tax system.
            Whether you&apos;re an individual, freelancer, or business, these
            steps will guide you through compliance and optimization.
          </p>
        </div>

        <div className="relative mt-10 flex justify-center">
          <div className="border-muted2 relative flex w-full flex-col border md:w-1/2 lg:w-full">
            {/* Top Row */}
            <div className="relative flex flex-col lg:flex-row">
              {/* Feature 1 */}
              <div className="border-muted2 flex flex-col justify-between border-b border-solid p-10 lg:w-3/5 lg:border-r lg:border-b-0">
                <h2 className="text-xl font-semibold">
                  Register with CFR (Commissioner for Revenue)
                </h2>
                <p className="text-muted-foreground">
                  Before paying or filing taxes, individuals and companies must
                  register with the CFR. This process can be completed online
                  using your e-ID or by submitting the necessary forms.
                </p>
                <div className="relative mt-8 aspect-[1.5] h-auto w-full lg:aspect-[2.4]">
                  <Image
                    src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg"
                    alt="Register with CFR"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col justify-between p-10 lg:w-2/5">
                <h2 className="text-xl font-semibold">
                  Determine Your Tax Category
                </h2>
                <p className="text-muted-foreground">
                  Malta distinguishes between resident, non-resident, and
                  domiciled individuals for taxation. Understand your status to
                  apply the correct rates and deductions.
                </p>
                <div className="relative mt-8 aspect-[1.45] h-auto w-full">
                  <Image
                    src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg"
                    alt="Determine Tax Category"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="border-muted2 relative flex flex-col border-t border-solid lg:flex-row">
              {/* Feature 3 */}
              <div className="border-muted2 flex flex-col justify-between border-b border-solid p-10 lg:w-2/5 lg:border-r lg:border-b-0">
                <h2 className="text-xl font-semibold">
                  File Annual Tax Returns
                </h2>
                <p className="text-muted-foreground">
                  Tax returns must be filed annually via the online tax portal.
                  Both individuals and companies must submit income declarations
                  and pay due taxes within the deadlines.
                </p>
                <div className="relative mt-8 aspect-[1.45] h-auto w-full">
                  <Image
                    src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg"
                    alt="File Tax Returns"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col justify-between p-10 lg:w-3/5">
                <h2 className="text-xl font-semibold">
                  Claim Deductions and Refunds
                </h2>
                <p className="text-muted-foreground">
                  Take advantage of available deductions such as education,
                  rent, or investment-related allowances. Refunds can be claimed
                  directly through the online portal after assessment.
                </p>
                <div className="relative mt-8 aspect-[1.5] h-auto w-full lg:aspect-[2.4]">
                  <Image
                    src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg"
                    alt="Claim Deductions and Refunds"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
