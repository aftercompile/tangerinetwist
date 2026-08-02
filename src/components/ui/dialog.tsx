"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

function DialogContent({
  className,
  children,
  title,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { title: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-warm-white p-0 shadow-lift outline-none data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out",
          className
        )}
        // Radix focuses the content (or the trigger, on close) automatically, and on
        // mobile that default focus() call makes the browser scroll the focused element
        // into view — which, combined with `scroll-behavior: smooth` on <html>, animates
        // a visible glide across whatever product cards sit between the trigger and this
        // fixed/centered dialog. preventScroll keeps focus (and keyboard/screen-reader
        // behavior) working without that scroll side effect.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.focus({ preventScroll: true });
        }}
        // Radix's default here refocuses the trigger button, which is the same
        // scroll-into-view risk in reverse. Skipping it is a fair trade: focus falls
        // back to the document instead of precisely returning to the trigger, but
        // nothing jumps.
        onCloseAutoFocus={(e) => e.preventDefault()}
        {...props}
      >
        <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
        {/* Content scrolls internally once it's taller than max-h, rather than the
            whole box growing past the viewport — min-h-0 is required here because a
            flex child otherwise refuses to shrink below its content's natural size,
            which would silently defeat the overflow-y-auto above it. */}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        <DialogPrimitive.Close className="absolute right-4 top-4 z-10 rounded-full bg-warm-white/90 p-2 text-charcoal/60 transition hover:bg-beige hover:text-charcoal">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Dialog, DialogTrigger, DialogClose, DialogContent };
