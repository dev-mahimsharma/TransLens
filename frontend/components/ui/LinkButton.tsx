"use client";

import { cn } from "@/lib/utils";

/**
 * A button that reads as a text link rather than a boxed UI control --
 * for actions that are secondary/informational (like "View real ID")
 * where a full bordered button would overstate their importance next to
 * primary actions like Edit/Delete/Continue.
 */
export function LinkButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "text-xs font-medium text-signal-cyan underline decoration-signal-cyan/40 underline-offset-2 transition-colors hover:decoration-signal-cyan disabled:cursor-not-allowed disabled:text-graphite disabled:no-underline",
        className
      )}
    >
      {children}
    </button>
  );
}