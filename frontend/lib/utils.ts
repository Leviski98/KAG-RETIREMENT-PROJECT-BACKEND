import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * The API's full_name falls back to the user's email when no name is set
 * (UserSerializer.get_full_name: get_full_name() or first_name or email),
 * so using it unguarded renders the email address as a "name" — e.g. a
 * greeting like "Welcome back, dev-admin@kag.test!". Falls back to a
 * generic label instead.
 */
export function getDisplayName(
  user: { full_name?: string | null; email?: string | null } | null | undefined,
  fallback = "Admin"
): string {
  const name = user?.full_name?.trim();
  const email = user?.email?.trim();
  return name && name !== email ? name : fallback;
}
