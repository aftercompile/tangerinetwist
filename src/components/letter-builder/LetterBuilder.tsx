"use client";

import * as React from "react";
import { toast } from "sonner";
import { Heart, RotateCcw, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatINR } from "@/lib/utils";
import type { BuilderConfig, BuilderFormatId, DesignPiece } from "@/lib/letter-builder/types";
import {
  HEART,
  derivePieces,
  initialState,
  priceDesign,
  sanitizeText,
  unavailablePieces,
  withText,
  type BuilderState,
} from "@/lib/letter-builder/design";
import { Charm } from "./Charm";
import { BUILDER_FONTS } from "./fonts";

/**
 * The ordering half of the name-keychain page. Fast path: type a word, tap a look, add to
 * cart. Mix-and-match path: tap any piece in the preview to give just that one its own style
 * or colour. Everything the customer sees is derived from `state` — a base look plus
 * per-piece exceptions — so retyping the word never wipes their choices.
 */
export function LetterBuilder({ config }: { config: BuilderConfig }) {
  const [state, setState] = React.useState<BuilderState>(() => initialState(config));
  const [selected, setSelected] = React.useState<number | null>(null);

  const pieces = derivePieces(config, state);
  const isEmpty = pieces.length === 0;
  // Placeholder word in the preview until they type, in the current look but greyed out.
  const ghostPieces = derivePieces(config, withText(state, "NAME"));
  const price = priceDesign(config, { format: state.format, pieces: isEmpty ? ghostPieces : pieces });
  const blocked = unavailablePieces(config, pieces);
  const remaining = config.maxPieces - pieces.length;

  function setText(raw: string) {
    const text = sanitizeText(raw, config.maxPieces);
    setState((s) => withText(s, text));
    if (selected !== null && selected >= Array.from(text).length) setSelected(null);
  }

  function setAllStyles(style: string) {
    setState((s) => ({ ...s, style, overrides: stripOverrides(s.overrides, "style") }));
  }

  function setPreset(preset: string) {
    setState((s) => ({ ...s, preset, overrides: stripOverrides(s.overrides, "color") }));
  }

  function setAllColors(color: string) {
    setState((s) => ({ ...s, preset: null, color, overrides: stripOverrides(s.overrides, "color") }));
  }

  function setPiece(index: number, patch: Partial<Pick<DesignPiece, "style" | "color">>) {
    setState((s) => ({ ...s, overrides: { ...s.overrides, [index]: { ...s.overrides[index], ...patch } } }));
  }

  function resetPiece(index: number) {
    setState((s) => {
      const rest = { ...s.overrides };
      delete rest[index];
      return { ...s, overrides: rest };
    });
  }

  function handleAddToCart() {
    // Prototype: the design is complete and priced, but cart/checkout/order storage is the
    // next build step.
    toast.success(`Looks great! Ordering opens soon — ${pieces.length} pieces, ${formatINR(price)}.`);
  }

  const selectedPiece = selected !== null ? pieces[selected] : null;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
      {/* Preview — stays in view on phones while they scroll through the options. */}
      <div className="sticky top-20 z-10 -mx-5 bg-cream/95 px-5 pb-3 pt-2 backdrop-blur-sm sm:mx-0 sm:rounded-b-3xl lg:top-28 lg:h-fit lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="rounded-[2rem] bg-warm-white px-4 py-6 shadow-soft sm:px-8 sm:py-10">
          <Charm
            pieces={isEmpty ? ghostPieces : pieces}
            ghost={isEmpty}
            format={state.format}
            config={config}
            maxSize="5.5rem"
            selectedIndex={selected}
            onSelect={isEmpty ? undefined : (i) => setSelected((cur) => (cur === i ? null : i))}
          />
        </div>
        <p className="mt-2 text-center text-xs text-muted">
          {isEmpty ? "Type below to see your design" : "Tip: tap a letter to change just that one"}
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {selectedPiece && selected !== null && (
          <PieceEditor
            index={selected}
            piece={selectedPiece}
            config={config}
            onStyle={(style) => setPiece(selected, { style })}
            onColor={(color) => setPiece(selected, { color })}
            onReset={() => resetPiece(selected)}
            onDone={() => setSelected(null)}
          />
        )}

        <Field label="Your word" hint={`${pieces.length}/${config.maxPieces}`}>
          <div className="flex gap-2">
            <input
              value={state.text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a name"
              aria-label="Your word"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className="h-14 w-full min-w-0 rounded-2xl border border-border bg-warm-white px-5 text-lg font-medium uppercase tracking-[0.12em] text-charcoal placeholder:normal-case placeholder:tracking-normal placeholder:text-muted/70 focus:border-charcoal focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setText(state.text + HEART)}
              disabled={remaining <= 0}
              aria-label="Add a heart"
              className="flex h-14 shrink-0 items-center gap-1.5 rounded-2xl border border-border bg-warm-white px-4 text-sm font-medium text-charcoal transition hover:border-charcoal disabled:opacity-40"
            >
              <Heart className="h-4 w-4 fill-tangerine-500 text-tangerine-500" /> Add
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">Letters A–Z, numbers 0–9 and ♥ — up to {config.maxPieces} pieces.</p>
        </Field>

        <Field label="Colours">
          <div className="flex flex-wrap gap-2">
            {config.presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setPreset(preset.id)}
                aria-pressed={state.preset === preset.id}
                className={chip(state.preset === preset.id)}
              >
                <span className="flex -space-x-1">
                  {preset.colors.slice(0, 4).map((id) => (
                    <span
                      key={id}
                      className="h-3.5 w-3.5 rounded-full ring-2 ring-warm-white"
                      style={{ background: config.colors.find((c) => c.id === id)?.hex }}
                    />
                  ))}
                </span>
                {preset.label}
              </button>
            ))}
          </div>
          <p className="mb-2 mt-4 text-xs text-muted">Or one colour for every piece</p>
          <Swatches config={config} value={state.preset ? null : state.color} onChange={setAllColors} />
        </Field>

        <Field label="Style">
          <StylePicker config={config} value={state.style} onChange={setAllStyles} />
        </Field>

        <Field label="Make it a">
          <div className="grid grid-cols-2 gap-3">
            {config.formats.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setState((s) => ({ ...s, format: f.id as BuilderFormatId }))}
                aria-pressed={state.format === f.id}
                className={cn(
                  "rounded-2xl border p-4 text-left transition",
                  state.format === f.id ? "border-charcoal bg-beige" : "border-border bg-warm-white hover:border-charcoal/50"
                )}
              >
                <span className="block text-sm font-semibold text-charcoal">{f.label}</span>
                <span className="mt-0.5 block text-xs text-muted">{f.blurb}</span>
              </button>
            ))}
          </div>
        </Field>

        <div className="rounded-3xl bg-warm-white p-5 shadow-soft">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-muted">
                {isEmpty
                  ? "Price for a 4-letter name"
                  : `${pieces.length} piece${pieces.length > 1 ? "s" : ""} · ${config.formats.find((f) => f.id === state.format)?.label}`}
              </p>
              <p className="mt-1 font-display text-3xl text-charcoal">{formatINR(price)}</p>
            </div>
            <p className="text-right text-xs text-muted">
              Made to order
              <br />
              Ships in 3–4 days
            </p>
          </div>
          {blocked.length > 0 && (
            <p className="mt-3 text-xs text-tangerine-700">Some pieces use a colour that just sold out — pick another.</p>
          )}
          <Button
            variant="accent"
            size="lg"
            className="mt-4 w-full"
            disabled={isEmpty || blocked.length > 0}
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-4 w-4" /> {isEmpty ? "Type a name to start" : "Add to Cart"}
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted">
            Personalised pieces can&apos;t be returned, but we&apos;ll replace anything that arrives damaged.
          </p>
        </div>
      </div>
    </div>
  );
}

function stripOverrides(
  overrides: BuilderState["overrides"],
  key: "style" | "color"
): BuilderState["overrides"] {
  return Object.fromEntries(
    Object.entries(overrides)
      .map(([i, o]) => {
        const rest = { ...o };
        delete rest[key];
        return [i, rest] as const;
      })
      .filter(([, o]) => Object.keys(o).length > 0)
  );
}

const chip = (active: boolean) =>
  cn(
    "flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition",
    active ? "border-charcoal bg-charcoal text-cream" : "border-border bg-warm-white text-charcoal hover:border-charcoal/50"
  );

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-charcoal">{label}</h3>
        {hint && <span className="text-xs tabular-nums text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Swatches({
  config,
  value,
  onChange,
}: {
  config: BuilderConfig;
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    // Even columns (up to 8 per row) so swatches shrink to fit narrow phones instead of
    // wrapping one orphan onto a second line.
    <div
      className="grid gap-2 sm:gap-2.5"
      style={{ gridTemplateColumns: `repeat(${Math.min(config.colors.length, 8)}, minmax(0, 2.5rem))` }}
    >
      {config.colors.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.id)}
          disabled={!c.available}
          aria-pressed={value === c.id}
          aria-label={`${c.label}${c.available ? "" : " (sold out)"}`}
          title={c.label}
          className={cn(
            "relative aspect-square w-full rounded-full ring-offset-2 ring-offset-cream transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30",
            value === c.id ? "ring-2 ring-charcoal" : "ring-1 ring-charcoal/10"
          )}
          style={{ background: c.hex }}
        />
      ))}
    </div>
  );
}

function StylePicker({
  config,
  value,
  onChange,
  compact = false,
}: {
  config: BuilderConfig;
  value: string;
  onChange: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {config.styles.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          aria-pressed={value === s.id}
          className={cn(
            "flex flex-col items-center rounded-2xl border transition",
            compact ? "py-2" : "py-4",
            value === s.id ? "border-charcoal bg-beige" : "border-border bg-warm-white hover:border-charcoal/50"
          )}
        >
          <span className={cn("leading-none text-charcoal", compact ? "text-2xl" : "text-3xl")} style={{ fontFamily: BUILDER_FONTS[s.font] }}>
            Aa
          </span>
          <span className="mt-1.5 text-xs text-muted">{s.label}</span>
        </button>
      ))}
    </div>
  );
}

function PieceEditor({
  index,
  piece,
  config,
  onStyle,
  onColor,
  onReset,
  onDone,
}: {
  index: number;
  piece: DesignPiece;
  config: BuilderConfig;
  onStyle: (id: string) => void;
  onColor: (id: string) => void;
  onReset: () => void;
  onDone: () => void;
}) {
  return (
    <div className="rounded-3xl border border-tangerine-200 bg-tangerine-50/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-charcoal">
          Just piece {index + 1}{" "}
          <span className="ml-1 rounded-md bg-warm-white px-2 py-0.5 font-mono">{piece.char}</span>
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onReset}
            className="flex h-9 items-center gap-1 rounded-full px-3 text-xs text-muted hover:bg-warm-white hover:text-charcoal"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Match the rest
          </button>
          <button
            type="button"
            onClick={onDone}
            aria-label="Done editing this piece"
            className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal hover:bg-warm-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <Swatches config={config} value={piece.color} onChange={onColor} />
      <div className="mt-4">
        <StylePicker config={config} value={piece.style} onChange={onStyle} compact />
      </div>
    </div>
  );
}
