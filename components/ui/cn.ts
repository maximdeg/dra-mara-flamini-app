/** Join class names, dropping falsey values. The repo's tiny clsx stand-in. */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
