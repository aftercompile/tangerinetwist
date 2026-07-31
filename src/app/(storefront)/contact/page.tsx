import { Metadata } from "next";
import { Mail, Phone, Instagram, MapPin } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Get in touch with the TangerineTwist studio — questions on orders, custom pieces, or wholesale enquiries.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="container-wide py-16 lg:py-24">
      <AnimatedReveal className="max-w-xl">
        <p className="eyebrow mb-4">Contact</p>
        <h1 className="h-display text-4xl leading-[1.1] md:text-5xl">Let&apos;s talk design.</h1>
        <p className="mt-5 text-base leading-relaxed text-muted">
          Questions about a product, a custom piece, or a wholesale enquiry — our studio team
          typically replies within one business day.
        </p>
      </AnimatedReveal>

      <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.1fr]">
        <AnimatedReveal delay={0.05}>
          <div className="flex flex-col gap-6">
            <ContactRow icon={Mail} label="Email" value="hello@tangerinetwist.in" href="mailto:hello@tangerinetwist.in" />
            <ContactRow icon={Phone} label="Phone" value="+91 63539 08104" href="tel:+916353908104" />
            <ContactRow icon={Instagram} label="Instagram" value="@tangerinetwist.studio" href="https://instagram.com" />
            <ContactRow icon={MapPin} label="Studio" value="TangerineTwist Design Studio, Vadodara, Gujarat, India" />
          </div>

          <div className="mt-10 aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-beige">
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted">
              <MapPin className="h-6 w-6" />
              <p className="text-xs">Map integration coming soon</p>
            </div>
          </div>
        </AnimatedReveal>

        <AnimatedReveal delay={0.1} className="rounded-3xl border border-border p-8 md:p-10">
          <h2 className="h-display text-xl">Send us a message</h2>
          <div className="mt-6">
            <ContactForm />
          </div>
        </AnimatedReveal>
      </div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-beige">
        <Icon className="h-4 w-4 text-tangerine-600" />
      </div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-charcoal">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="transition hover:opacity-70">
      {content}
    </a>
  ) : (
    content
  );
}
