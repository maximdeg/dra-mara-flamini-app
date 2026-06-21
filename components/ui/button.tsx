import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from "react";
import { cn } from "./cn";
import styles from "./button.module.css";

export type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";

type ButtonOwnProps<E extends ElementType> = {
  /** Render as a different element/component (e.g. next/link) while keeping the button look. */
  as?: E;
  variant?: ButtonVariant;
  /** Shows a busy state; also disables the control when rendered as a native button. */
  busy?: boolean;
  className?: string;
  children?: ReactNode;
};

export type ButtonProps<E extends ElementType> = ButtonOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof ButtonOwnProps<E>>;

/**
 * The shared action primitive. Defaults to a native `<button>`; pass `as` to keep
 * the look on a link (`as={Link}`) or any other element. `variant` selects the
 * brand treatment; `busy` shows a pending state.
 */
export function Button<E extends ElementType = "button">({
  as,
  variant = "primary",
  busy = false,
  className,
  children,
  ...rest
}: ButtonProps<E>) {
  const Component: ElementType = as ?? "button";
  const isNativeButton = Component === "button";

  const nativeButtonProps = isNativeButton
    ? {
        type:
          (rest as { type?: "button" | "submit" | "reset" }).type ?? "button",
        disabled: (rest as { disabled?: boolean }).disabled === true || busy,
      }
    : {};

  return (
    <Component
      className={cn(
        styles.button,
        styles[variant],
        busy && styles.busy,
        className,
      )}
      aria-busy={busy || undefined}
      {...rest}
      {...nativeButtonProps}
    >
      {children}
    </Component>
  );
}
