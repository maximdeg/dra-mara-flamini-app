// Form state shared between the profile server actions and their client forms.
// Kept out of actions.ts because a "use server" module may only export async
// functions.
export interface ProfileFormState {
  ok?: boolean;
  error?: string;
}

export interface PasswordFormState {
  ok?: boolean;
  error?: string;
}
