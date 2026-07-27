import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("btn-base", {
  variants: {
    variant: {
      primary: "bg-charcoal text-cream hover:bg-tangerine-600 active:bg-tangerine-700",
      accent: "bg-tangerine-500 text-white hover:bg-tangerine-600 shadow-soft",
      outline:
        "border border-charcoal/20 text-charcoal bg-transparent hover:border-charcoal hover:bg-charcoal hover:text-cream",
      ghost: "text-charcoal hover:bg-beige",
      link: "text-charcoal underline-offset-4 hover:underline p-0 h-auto rounded-none",
      light: "bg-cream text-charcoal hover:bg-beige border border-border",
    },
    size: {
      sm: "h-9 px-4 text-xs",
      md: "h-11 px-6",
      lg: "h-14 px-9 text-base",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
