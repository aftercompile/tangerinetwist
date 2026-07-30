import { AnimatedReveal } from "@/components/shared/AnimatedReveal";

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-wide flex justify-center py-16 lg:py-24">
      <AnimatedReveal className="w-full max-w-md rounded-3xl border border-border p-8 md:p-10">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="h-display text-3xl">{title}</h1>
        {description && <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>}
        <div className="mt-8">{children}</div>
      </AnimatedReveal>
    </div>
  );
}
