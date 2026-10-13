"use client";

import * as React from "react";
import { toast } from "sonner";
import { Heart, RotateCcw, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatINR } from "@/lib/utils";
import type { BuilderConfig, BuilderFormatId, Design, DesignPiece } from "@/lib/letter-builder/types";
import {
  HEART,
  colorHex,
  derivePieces,
  initialState,
  priceDesign,
  sanitizeText,
  strip,
  unavailablePieces,
  withPreset,
  withText,
  type BuilderState,
} from "@/lib/letter-builder/design";
import { CharmSvg } from "./CharmSvg";
import { BUILDER_FONTS } from "./fonts";

type Look = Pick<DesignPiece, "style" | "body" | "ink">;

/**
 * The ordering half of the name-keychain page. Fast path: type a word, tap a look, add to
 * cart. Mix-and-match path: tap any piece in the preview to give just that one its own bead
 * colour, letter colour or style. Everything shown is derived from `state` — a base look
 * plus per-piece exceptions — so retyping the word never wipes their choices.
 */
export function LetterBuilder({ config }: { config: BuilderConfig }) {
  const [state, setState] = React.useState<BuilderState>(() => initialState(config));
  const [selected, setSelected] = React.useState<number | null>(null);

  const pieces = derivePieces(config, state);
  const isEmpty = pieces.length === 0;
  const ghostPieces = derivePieces(config, withText(state, "NAME"));
  const design: Design = { format: state.format, trim: state.trim, pieces: isEmpty ? ghostPieces : pieces };
  const price = priceDesign(config, design);
  const blocked = unavailablePieces(config, pieces);
  const format = config.formats.find((f) => f.id === state.format) ?? config.formats[0];
  const pieceWord = state.format === "clicker" ? "Key" : "Bead";

  function setText(raw: string) {
    const text = sanitizeText(raw, config.maxPieces);
    setState((s) => withText(s, text));
    if (selected !== null && selected >= Array.from(text).length) setSelected(null);
  }

  // A choice "for every piece" also clears that property's per-piece exceptions; picking one
  // bead colour for all replaces the look's colour pattern.
  const setAll = (patch: Partial<Pick<BuilderState, "style" | "body" | "ink" | "trim">>) =>
    setState((s) => ({
      ...s,
      ...patch,
      ...(patch.body ? { preset: null } : {}),
      overrides: strip(s.overrides, Object.keys(patch).filter((k) => k !== "trim") as (keyof Look)[]),
    }));

  const setPiece = (index: number, patch: Partial<Look>) =>
    setState((s) => ({ ...s, overrides: { ...s.overrides, [index]: { ...s.overrides[index], ...patch } } }));

  function resetPiece(index: number) {
    setState((s) => {
      const rest = { ...s.overrides };
      delete rest[index];
      return { ...s, overrides: rest };
    });
  }

  function handleAddToCart() {
    // Prototype: the design is complete and priced; saving it to cart/orders is next.
    toast.success(`Looks great! Ordering opens soon — ${pieces.length} pieces, ${formatINR(price)}.`);
  }

  const selectedPiece = selected !== null ? pieces[selected] : null;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
      {/* Preview — stays in view on phones while they work through the options. */}
      <div className="sticky top-20 z-10 -mx-5 bg-[#FBF8F3]/95 px-5 pb-2 pt-2 backdrop-blur-sm sm:mx-0 lg:top-28 lg:h-fit lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="rounded-[2rem] bg-white/80 px-3 py-5 shadow-soft ring-1 ring-charcoal/5 sm:px-8 sm:py-8">
          <CharmSvg
            design={design}
            config={config}
            ghost={isEmpty}
            selectedIndex={selected}
            onSelect={isEmpty ? undefined : (i) => setSelected((cur) => (cur === i ? null : i))}
            className="mx-auto max-h-[30vh] lg:max-h-none"
          />
        </div>
        <p className="mt-2 text-center text-xs text-charcoal/60">
          {isEmpty ? "Type your word below to start" : `Tip: tap a ${pieceWord.toLowerCase()} to change just that one`}
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {selectedPiece && selected !== null && (
          <PieceEditor
            index={selected}
            piece={selectedPiece}
            pieceWord={pieceWord}
            config={config}
            onChange={(patch) => setPiece(selected, patch)}
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
              className="h-14 w-full min-w-0 rounded-2xl border-2 border-charcoal/10 bg-white px-5 text-xl uppercase tracking-[0.14em] text-charcoal placeholder:normal-case placeholder:tracking-normal placeholder:text-charcoal/40 focus:border-tangerine-400 focus:outline-none"
              style={{ fontFamily: BUILDER_FONTS.lilita }}
            />
            <button
              type="button"
              onClick={() => setText(state.text + HEART)}
              disabled={pieces.length >= config.maxPieces}
              aria-label="Add a heart"
              className="flex h-14 shrink-0 items-center gap-1.5 rounded-2xl border-2 border-charcoal/10 bg-white px-4 text-sm font-medium text-charcoal transition hover:border-tangerine-400 disabled:opacity-40"
            >
              <Heart className="h-4 w-4 fill-[#F7B2C6] text-[#D9547E]" /> Add
            </button>
          </div>
          <p className="mt-2 text-xs text-charcoal/60">Letters A–Z, numbers 0–9 and ♥ — up to {config.maxPieces} pieces.</p>
        </Field>

        <Field label="Pick a look">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
            {config.presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setState((s) => withPreset(config, s, p.id))}
                aria-pressed={state.preset === p.id}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-2.5 transition",
                  state.preset === p.id ? "border-charcoal bg-white" : "border-transparent bg-white/70 hover:border-charcoal/20"
                )}
              >
                <span className="flex -space-x-1">
                  {[0, 1, 2].map((k) => (
                    <span
                      key={k}
                      className="flex h-6 w-5 items-center justify-center rounded-md text-[10px] leading-none shadow-[0_0_0_1px_rgba(27,24,21,0.12)] ring-2 ring-white"
                      style={{
                        background: colorHex(config, p.bodies[k % p.bodies.length]),
                        color: colorHex(config, p.ink),
                        fontFamily: BUILDER_FONTS.lilita,
                      }}
                    >
                      {"ABC"[k]}
                    </span>
                  ))}
                </span>
                <span className="text-xs font-medium text-charcoal">{p.label}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label={`${pieceWord} colour`} sub="for every piece">
          <Swatches config={config} value={state.preset ? null : state.body} onChange={(body) => setAll({ body })} />
        </Field>
        <Field label="Letter colour" sub="for every piece">
          <Swatches config={config} value={state.ink} onChange={(ink) => setAll({ ink })} />
        </Field>
        <Field label={`${format.trimLabel} colour`}>
          <Swatches config={config} value={state.trim} onChange={(trim) => setAll({ trim })} />
        </Field>

        <Field label="Style">
          <StylePicker config={config} value={state.style} onChange={(style) => setAll({ style })} />
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
                  "rounded-2xl border-2 p-4 text-left transition",
                  state.format === f.id ? "border-charcoal bg-white" : "border-transparent bg-white/70 hover:border-charcoal/20"
                )}
              >
                <span className="block text-sm font-semibold text-charcoal">{f.label}</span>
                <span className="mt-0.5 block text-xs text-charcoal/60">{f.blurb}</span>
                <span className="mt-2 block text-xs font-medium text-tangerine-600">
                  from {formatINR(f.basePrice + config.perPiecePrice)}
                </span>
              </button>
            ))}
          </div>
        </Field>

        <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-charcoal/5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-charcoal/60">
                {isEmpty ? "Price for a 4-letter name" : `${pieces.length} piece${pieces.length > 1 ? "s" : ""} · ${format.label}`}
              </p>
              <p className="mt-1 text-4xl text-charcoal" style={{ fontFamily: BUILDER_FONTS.lilita }}>
                {formatINR(price)}
              </p>
            </div>
            <p className="text-right text-xs text-charcoal/60">
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
            className="mt-4 w-full shadow-[0_6px_0_#C4521C] active:translate-y-1 active:shadow-[0_2px_0_#C4521C] disabled:shadow-none"
            disabled={isEmpty || blocked.length > 0}
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-4 w-4" /> {isEmpty ? "Type a name to start" : "Add to Cart"}
          </Button>
          <p className="mt-3 text-center text-[11px] text-charcoal/60">
            Personalised pieces can&apos;t be returned — but anything that arrives damaged gets replaced.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, sub, hint, children }: { label: string; sub?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-charcoal">
          {label}
          {sub && <span className="ml-2 text-xs font-normal normal-case tracking-normal text-charcoal/50">{sub}</span>}
        </h3>
        {hint && <span className="text-xs tabular-nums text-charcoal/60">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Swatches({ config, value, onChange }: { config: BuilderConfig; value: string | null; onChange: (id: string) => void }) {
  const perRow = config.colors.length <= 8 ? config.colors.length : Math.ceil(config.colors.length / 2);
  return (
    // Even columns, so swatches shrink to fit narrow phones instead of leaving an orphan row.
    <div className="grid gap-2 sm:gap-2.5" style={{ gridTemplateColumns: `repeat(${perRow}, minmax(0, 2.6rem))` }}>
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
            "relative aspect-square w-full rounded-full ring-offset-2 ring-offset-[#FBF8F3] transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-30",
            value === c.id ? "scale-110 ring-2 ring-charcoal" : "ring-1 ring-charcoal/15"
          )}
          style={{ background: `radial-gradient(circle at 32% 28%, #FFFFFF99 0 18%, transparent 19%), ${c.hex}` }}
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
    <div className="grid grid-cols-3 gap-2.5">
      {config.styles.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          aria-pressed={value === s.id}
          className={cn(
            "flex flex-col items-center rounded-2xl border-2 transition",
            compact ? "py-2" : "py-4",
            value === s.id ? "border-charcoal bg-white" : "border-transparent bg-white/70 hover:border-charcoal/20"
          )}
        >
          <span className={cn("leading-none text-charcoal", compact ? "text-2xl" : "text-3xl")} style={{ fontFamily: BUILDER_FONTS[s.font] }}>
            Aa
          </span>
          <span className="mt-1.5 text-xs text-charcoal/60">{s.label}</span>
        </button>
      ))}
    </div>
  );
}

function PieceEditor({
  index,
  piece,
  pieceWord,
  config,
  onChange,
  onReset,
  onDone,
}: {
  index: number;
  piece: DesignPiece;
  pieceWord: string;
  config: BuilderConfig;
  onChange: (patch: Partial<Look>) => void;
  onReset: () => void;
  onDone: () => void;
}) {
  return (
    <div className="rounded-3xl border-2 border-[#F7B2C6] bg-[#FDECF2] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-charcoal">
          Just {pieceWord.toLowerCase()} {index + 1}{" "}
          <span
            className="ml-1 inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 text-base"
            style={{ background: colorHex(config, piece.body), color: colorHex(config, piece.ink), fontFamily: BUILDER_FONTS.lilita }}
          >
            {piece.char}
          </span>
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onReset}
            className="flex h-9 items-center gap-1 rounded-full px-3 text-xs text-charcoal/60 hover:bg-white hover:text-charcoal"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Match the rest
          </button>
          <button
            type="button"
            onClick={onDone}
            aria-label="Done editing this piece"
            className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mb-2 text-xs font-medium text-charcoal/70">{pieceWord} colour</p>
      <Swatches config={config} value={piece.body} onChange={(body) => onChange({ body })} />
      <p className="mb-2 mt-4 text-xs font-medium text-charcoal/70">Letter colour</p>
      <Swatches config={config} value={piece.ink} onChange={(ink) => onChange({ ink })} />
      <div className="mt-4">
        <StylePicker config={config} value={piece.style} onChange={(style) => onChange({ style })} compact />
      </div>
    </div>
  );
}
