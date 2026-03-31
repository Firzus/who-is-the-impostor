import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

type Side = "top" | "bottom";

interface OnboardingTooltipProps {
  open: boolean;
  side?: Side;
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  onNext: () => void;
  onDismiss: () => void;
  children: React.ReactNode;
}

interface Position {
  top: number;
  left: number;
  arrowLeft: number;
}

export function OnboardingTooltip({
  open,
  side = "bottom",
  step,
  totalSteps,
  title,
  description,
  onNext,
  onDismiss,
  children,
}: OnboardingTooltipProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<Position | null>(null);

  const updatePosition = useCallback(() => {
    const wrapper = wrapperRef.current;
    const tooltip = tooltipRef.current;
    if (!wrapper || !tooltip) return;

    const rect = wrapper.getBoundingClientRect();
    const tooltipWidth = 288;
    const gap = 12;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    const arrowIdealLeft = tooltipWidth / 2;
    let arrowLeft = arrowIdealLeft;

    const margin = 12;
    if (left < margin) {
      arrowLeft = arrowIdealLeft + left - margin;
      left = margin;
    } else if (left + tooltipWidth > window.innerWidth - margin) {
      const overflow = left + tooltipWidth - (window.innerWidth - margin);
      arrowLeft = arrowIdealLeft + overflow;
      left = window.innerWidth - margin - tooltipWidth;
    }

    const top =
      side === "bottom"
        ? rect.bottom + gap
        : rect.top - gap;

    setPos({ top, left, arrowLeft });
  }, [side]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(updatePosition);
      const timer = setTimeout(() => setVisible(true), 80);

      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
    setVisible(false);
    setPos(null);
  }, [open, updatePosition]);

  const isLast = step === totalSteps - 1;

  const tooltipContent = open && pos && createPortal(
    <div
      ref={tooltipRef}
      className="fixed w-72 transition-all duration-300"
      style={{
        zIndex: 9999,
        top: side === "bottom" ? pos.top : undefined,
        bottom: side === "top" ? window.innerHeight - pos.top : undefined,
        left: pos.left,
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? "0" : side === "bottom" ? "-8px" : "8px"})`,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Arrow */}
      <div
        className="absolute -translate-x-1/2"
        style={{
          left: pos.arrowLeft,
          ...(side === "bottom" ? { top: -6 } : { bottom: -6 }),
        }}
      >
        <div
          className="h-3 w-3 rotate-45"
          style={{
            background: "rgba(10, 14, 20, 0.92)",
            border: "1px solid rgba(80, 200, 120, 0.15)",
            ...(side === "bottom"
              ? { borderBottom: "none", borderRight: "none" }
              : { borderTop: "none", borderLeft: "none" }),
          }}
        />
      </div>

      {/* Body */}
      <div
        role="tooltip"
        className="relative overflow-hidden p-4"
        style={{
          background: "rgba(10, 14, 20, 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(80, 200, 120, 0.15)",
          boxShadow:
            "0 0 30px rgba(80, 200, 120, 0.08), 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(80, 200, 120, 0.06)",
        }}
      >
        {/* Progress dots */}
        <div className="mb-3 flex items-center gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className="h-1 transition-all duration-300"
              style={{
                width: i === step ? 16 : 6,
                background:
                  i === step
                    ? "#50C878"
                    : i < step
                      ? "rgba(80, 200, 120, 0.4)"
                      : "rgba(255, 255, 255, 0.1)",
              }}
            />
          ))}
        </div>

        <h4 className="font-heading text-sm font-bold tracking-wide text-foreground">
          {title}
        </h4>
        <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">
          {description}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onDismiss}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-foreground/70 transition-colors hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#50C878]/70 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent cursor-pointer"
          >
            Passer
          </button>
          <Button size="sm" onClick={onNext} className="h-7 px-3 text-xs">
            {isLast ? "Compris !" : "Suivant"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );

  return (
    <div ref={wrapperRef} className="relative">
      {/* Highlight ring when active */}
      {open && (
        <div
          className="pointer-events-none absolute -inset-1.5 animate-pulse"
          style={{ border: "1px solid rgba(80, 200, 120, 0.25)", zIndex: 40 }}
          aria-hidden
        />
      )}
      {children}
      {tooltipContent}
    </div>
  );
}
