"use client";

import * as React from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { suggestAddresses, retrieveAddress, type AddressSuggestion, type RetrievedAddress } from "@/lib/google-places";
import { cn } from "@/lib/utils";

/**
 * Address-line input with Google Places suggestions dropping in below it — used on
 * both CheckoutForm.tsx and the account page's AddressDialog.tsx, same address-entry
 * UX in both places. Field stays a plain controlled text input throughout (no lock-in
 * to a suggestion), so typing and editing manually always still works, same "never
 * required, always overridable" philosophy the PIN-code lookup already uses.
 *
 * Built on the Popover primitive (portaled, Radix-positioned) rather than a plain
 * absolutely-positioned dropdown — AddressDialog.tsx's modal body is overflow-y-auto,
 * which would clip a non-portaled dropdown the moment it needed more room than was
 * left below the field.
 */
export function AddressAutocomplete({
  id,
  label,
  value,
  onChange,
  onSelect,
  required,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: RetrievedAddress) => void;
  required?: boolean;
  className?: string;
}) {
  const [suggestions, setSuggestions] = React.useState<AddressSuggestion[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  // Empty string means "no session in progress" — set on the first search of a new
  // address-entry session, cleared after a selection closes it out. Google bills a
  // full suggest-then-retrieve session as one unit only when the same token threads
  // through both calls, so this must survive across the debounced re-renders below.
  const sessionTokenRef = React.useRef<string>("");

  React.useEffect(() => {
    if (value.trim().length < 4) {
      setSuggestions([]);
      setLoading(false);
      setOpen(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      if (!sessionTokenRef.current) sessionTokenRef.current = crypto.randomUUID();
      const results = await suggestAddresses(value, sessionTokenRef.current, controller.signal);
      if (controller.signal.aborted) return;
      setSuggestions(results);
      setLoading(false);
      setOpen(results.length > 0);
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the typed text should retrigger this
  }, [value]);

  async function handleSelect(suggestion: AddressSuggestion) {
    const token = sessionTokenRef.current || crypto.randomUUID();
    setOpen(false);
    setSuggestions([]);
    const address = await retrieveAddress(suggestion.placeId, token);
    // Next search starts a fresh billable session, whether or not this retrieve
    // actually succeeded.
    sessionTokenRef.current = "";
    if (address) {
      onSelect(address);
    } else {
      // Retrieve failed (network hiccup) — still better than leaving whatever
      // partial text was typed, and every field stays editable regardless.
      onChange(suggestion.mainText);
    }
  }

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative">
            <Input
              id={id}
              name={id}
              autoComplete="off"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setOpen(suggestions.length > 0)}
              required={required}
            />
            {loading && (
              <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted" />
            )}
          </div>
        </PopoverAnchor>
        {/* Auto-focus prevented so opening the popover never steals focus away from
            the input mid-type — dismissal still happens normally (outside click,
            Escape, or picking a suggestion). */}
        <PopoverContent
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn("w-[var(--radix-popover-trigger-width)] p-1")}
        >
          <ul>
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  onClick={() => handleSelect(s)}
                  className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-beige"
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
                  <span>
                    <span className="text-charcoal">{s.mainText}</span>
                    {s.secondaryText && <span className="block text-xs text-muted">{s.secondaryText}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
