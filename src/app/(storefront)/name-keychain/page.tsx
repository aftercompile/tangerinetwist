import { Metadata } from "next";
import { PackageCheck, Printer, ShieldCheck } from "lucide-react";
import { SmoothScroll } from "@/components/shared/SmoothScroll";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { StringingHero } from "@/components/letter-builder/StringingHero";
import { AlphabetSection } from "@/components/letter-builder/AlphabetSection";
import { TwoWaysSection } from "@/components/letter-builder/TwoWaysSection";
import { LetterBuilder } from "@/components/letter-builder/LetterBuilder";
import { MakeYoursBar } from "@/components/letter-builder/MakeYoursBar";
import { BUILDER_FONTS } from "@/components/letter-builder/fonts";
import { DEMO_BUILDER_CONFIG } from "@/lib/letter-builder/demo-config";
import { startingPrice } from "@/lib/letter-builder/design";
import { buildMetadata } from "@/lib/seo";

// Prototype: kept out of search results until ordering is wired up and real prices are set.
export const metadata: Metadata = {
  ...buildMetadata({
    title: "Personalised Name Keychain & Clicker",
    description:
      "Spell any name in 3D-printed letter beads or keycaps — pick the colour of every bead and every letter. Made to order in India.",
    path: "/name-keychain",
  }),
  robots: { index: false, follow: false },
};

const REASSURANCE = [
  { icon: Printer, title: "Printed for you", body: "Every bead and key is printed to order in our studio in India.", tint: "#FDECF2" },
  { icon: PackageCheck, title: "Ships in 3–4 days", body: "Free shipping over ₹799, flat ₹79 below that.", tint: "#E3F6F7" },
  { icon: ShieldCheck, title: "Arrives perfect", body: "Personalised pieces can't be returned — but anything damaged gets replaced.", tint: "#EEE8FC" },
];

export default function NameKeychainPage() {
  const config = DEMO_BUILDER_CONFIG;

  return (
    <div className="relative bg-[#FBF8F3]">
      <SmoothScroll />
      <StringingHero config={config} />
      <AlphabetSection config={config} />
      <TwoWaysSection config={config} />

      <section id="make-yours" className="scroll-mt-20 py-16 lg:py-24">
        <div className="container-wide">
          <AnimatedReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-tangerine-600">Make yours</p>
            <h2 className="mt-3 text-4xl leading-tight text-charcoal sm:text-5xl" style={{ fontFamily: BUILDER_FONTS.lilita }}>
              Spell it. Colour it. Done.
            </h2>
          </AnimatedReveal>
          <div className="mt-10">
            <LetterBuilder config={config} />
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-wide grid grid-cols-1 gap-4 sm:grid-cols-3">
          {REASSURANCE.map((item, i) => (
            <AnimatedReveal key={item.title} delay={i * 0.06}>
              <div className="h-full rounded-3xl p-6" style={{ background: item.tint }}>
                <item.icon className="h-5 w-5 text-charcoal" strokeWidth={1.75} />
                <h3 className="mt-3 text-lg text-charcoal" style={{ fontFamily: BUILDER_FONTS.lilita }}>
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-charcoal/70">{item.body}</p>
              </div>
            </AnimatedReveal>
          ))}
        </div>
      </section>

      <MakeYoursBar fromPrice={startingPrice(config)} />
    </div>
  );
}
