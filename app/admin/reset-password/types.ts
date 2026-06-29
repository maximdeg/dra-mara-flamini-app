// Form state shared between the reset action and its client form
// (a "use server" module may only export async functions).
export interface ResetPasswordState {
  /** True once the password was changed (the form then shows a success panel). */
  ok?: boolean;
  error?: string;
}
