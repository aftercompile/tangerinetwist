import { Metadata } from "next";
import { PackageCheck, Printer, ShieldCheck } from "lucide-react";
import { SmoothScroll } from "@/components/shared/SmoothScroll";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { NameKeychainHero } from "@/components/letter-builder/NameKeychainHero";
import { LetterBuilder } from "@/components/letter-builder/LetterBuilder";
import { MakeYoursBar } from "@/components/letter-builder/MakeYoursBar";
import { DEMO_BUILDER_CONFIG } from "@/lib/letter-builder/demo-config";
import { startingPrice } from "@/lib/letter-builder/design";
import { buildMetadata } from "@/lib/seo";

// Prototype: kept out of search results until ordering is wired up and real prices are set.
export const metadata: Metadata = {
  ...buildMetadata({
    title: "Personalised Name Keychain & Clicker",
    description:
      "Spell any name in 3D-printed letters — pick the colour and style of every piece, as a keychain or a clicker. Made to order in India.",
    path: "/name-keychain",
  }),
  robots: { index: false, follow: false },
};

const REASSURANCE = [
  { icon: Printer, title: "Printed for you", body: "Every piece is printed to order in our studio in India." },
  { icon: PackageCheck, title: "Ships in 3–4 days", body: "Free shipping over ₹799, flat ₹79 below that." },
  { icon: ShieldCheck, title: "Arrives perfect", body: "Personalised pieces can't be returned — but anything damaged gets replaced." },
];

export default function NameKeychainPage() {
  const config = DEMO_BUILDER_CONFIG;

  return (
    <>
      <SmoothScroll />
      <NameKeychainHero config={config} />

      <section id="make-yours" className="scroll-mt-20 border-t border-border/60 bg-cream py-16 lg:py-24">
        <div className="container-wide">
          <AnimatedReveal>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-tangerine-600">Make yours</p>
            <h2 className="h-display mt-3 text-3xl sm:text-4xl">Spell it. Colour it. Done.</h2>
          </AnimatedReveal>
          <div className="mt-10">
            <LetterBuilder config={config} />
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 py-14">
        <div className="container-wide grid grid-cols-1 gap-8 sm:grid-cols-3">
          {REASSURANCE.map((item, i) => (
            <AnimatedReveal key={item.title} delay={i * 0.06}>
              <item.icon className="h-5 w-5 text-tangerine-600" strokeWidth={1.75} />
              <h3 className="mt-3 text-base font-semibold text-charcoal">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
            </AnimatedReveal>
          ))}
        </div>
      </section>

      <MakeYoursBar fromPrice={startingPrice(config)} />
    </>
  );
}
