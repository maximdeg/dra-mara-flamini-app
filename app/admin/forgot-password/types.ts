// Form state shared between the request-reset action and its client form
// (a "use server" module may only export async functions).
export interface RequestResetState {
  /** True once the request was accepted (shown as a neutral confirmation). */
  ok?: boolean;
  error?: string;
}
