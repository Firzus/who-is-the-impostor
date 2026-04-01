import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#50C878]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 cursor-pointer active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-[#50C878] text-[#050f08] font-bold uppercase tracking-[0.12em] shadow-[0_1px_20px_rgba(80,200,120,0.15)] hover:bg-[#5dd888] hover:shadow-[0_2px_30px_rgba(80,200,120,0.25)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_1px_12px_rgba(212,64,64,0.2)] hover:bg-destructive/90",
        outline:
          "border border-[#50C878]/30 bg-transparent text-[#50C878] font-bold uppercase tracking-[0.12em] hover:bg-[#50C878]/5 hover:border-[#50C878]/55",
        secondary:
          "glass glass-border text-foreground font-semibold hover:bg-accent",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base font-bold tracking-wide",
        xl: "h-14 px-10 text-base font-bold tracking-[0.14em] sm:h-[3.75rem] sm:px-12 sm:text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> { }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
