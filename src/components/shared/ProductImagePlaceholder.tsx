import { cn } from "@/lib/utils";
import { getIcon } from "./icon-map";

const toneStyles: Record<string, { bg: string; iconBg: string; iconColor: string }> = {
  warm: {
    bg: "radial-gradient(120% 100% at 50% 0%, #FBF1E4 0%, #F3E2C9 55%, #E9D2AC 100%)",
    iconBg: "linear-gradient(160deg, #FFFDFB 0%, #F0E2CB 100%)",
    iconColor: "#C7752F",
  },
  beige: {
    bg: "radial-gradient(120% 100% at 50% 0%, #F6F1E7 0%, #ECE1CC 55%, #DFCFAE 100%)",
    iconBg: "linear-gradient(160deg, #FFFDFB 0%, #E9DCC0 100%)",
    iconColor: "#8A6E3F",
  },
  cool: {
    bg: "radial-gradient(120% 100% at 50% 0%, #F7F6F3 0%, #EBE8E1 55%, #DAD5C9 100%)",
    iconBg: "linear-gradient(160deg, #FFFFFF 0%, #E4E0D6 100%)",
    iconColor: "#6B6459",
  },
  charcoal: {
    bg: "radial-gradient(120% 100% at 50% 0%, #38332D 0%, #221F1A 55%, #16130F 100%)",
    iconBg: "linear-gradient(160deg, #4A443C 0%, #29251F 100%)",
    iconColor: "#F0A164",
  },
};

export function ProductImagePlaceholder({
  icon,
  tone = "beige",
  className,
  iconClassName,
}: {
  icon: string;
  tone?: "warm" | "cool" | "charcoal" | "beige";
  className?: string;
  iconClassName?: string;
}) {
  const Icon = getIcon(icon);
  const style = toneStyles[tone] ?? toneStyles.beige;

  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{ background: style.bg }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-[62%] h-[18%] w-[46%] -translate-x-1/2 rounded-full opacity-20 blur-xl"
        style={{ background: tone === "charcoal" ? "#000" : "#4a3a22" }}
      />
      <div
        className={cn(
          "relative flex aspect-square w-[38%] items-center justify-center rounded-full shadow-[0_12px_32px_-8px_rgba(0,0,0,0.25)]",
          iconClassName
        )}
        style={{ background: style.iconBg }}
      >
        <Icon className="h-[42%] w-[42%]" style={{ color: style.iconColor }} strokeWidth={1.25} />
      </div>
    </div>
  );
}
