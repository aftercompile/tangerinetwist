import { AnimatedReveal } from "@/components/shared/AnimatedReveal";

export function LegalPageLayout({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-wide py-16 lg:py-24">
      <AnimatedReveal className="mx-auto max-w-3xl">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="h-display text-4xl leading-[1.1] md:text-5xl">{title}</h1>
        <p className="mt-4 text-sm text-muted">Last updated: {updated}</p>

        <div className="mt-12 flex flex-col gap-10">{children}</div>
      </AnimatedReveal>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="h-display text-xl md:text-2xl">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-muted [&_a]:text-tangerine-600 [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-medium [&_strong]:text-charcoal [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
        {children}
      </div>
    </section>
  );
}
