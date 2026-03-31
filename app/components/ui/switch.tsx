import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center border border-border/40 transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#50C878]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-40",
      "data-[state=checked]:bg-[#50C878]/20 data-[state=checked]:border-[#50C878]/40",
      "data-[state=unchecked]:bg-muted/40",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-3.5 w-3.5 shadow-sm transition-transform duration-200",
        "data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-[#50C878]",
        "data-[state=unchecked]:translate-x-[2px] data-[state=unchecked]:bg-muted-foreground/60",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = "Switch";

export { Switch };
