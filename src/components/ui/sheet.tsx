"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;

function SheetContent({
  className,
  children,
  side = "right",
  title,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Content> & {
  side?: "left" | "right";
  title: string;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
      <Dialog.Content
        className={cn(
          "fixed inset-y-0 z-50 flex h-full w-full max-w-md flex-col bg-warm-white shadow-lift outline-none",
          side === "right"
            ? "right-0 data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right"
            : "left-0 data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left",
          className
        )}
        {...props}
      >
        <Dialog.Title className="sr-only">{title}</Dialog.Title>
        {children}
        <Dialog.Close className="absolute right-5 top-5 rounded-full p-2 text-charcoal/60 transition hover:bg-beige hover:text-charcoal">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent };
