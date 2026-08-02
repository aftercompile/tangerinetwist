"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { transitions } from "@/lib/motion";

export interface FilterChipOption {
  id: string;
  label: string;
}

// Replaces the old fixed sidebar. Multi-select (several chips can be active at
// once), so unlike SortSegmented there's no single sliding highlight — each
// chip just transitions its own background/border on toggle. Sticky beneath
// the navbar (h-20 -> top-20) while the grid scrolls underneath it.
export function FilterChips({
  options,
  active,
  onToggle,
  onClear,
}: {
  options: FilterChipOption[];
  active: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="sticky top-20 z-30 -mx-4 bg-cream/95 px-4 py-4 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:border-border sm:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <Chip label="All" active={active.length === 0} onClick={onClear} />
        {options.map((opt) => (
          <Chip key={opt.id} label={opt.label} active={active.includes(opt.id)} onClick={() => onToggle(opt.id)} />
        ))}
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileTap={{ scale: 0.94 }}
      transition={transitions.hover}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ease-premium",
        active
          ? "border-charcoal bg-charcoal text-cream"
          : "border-border bg-warm-white text-charcoal hover:border-charcoal/40 hover:bg-beige"
      )}
    >
      {label}
    </motion.button>
  );
}
