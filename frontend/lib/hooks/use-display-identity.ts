import { useAuth } from "@/components/providers";
import { useSettings } from "@/lib/hooks/use-settings";

/**
 * The signed-in user's display name, email, and avatar initials — shared by
 * the sidebar and navbar so their two avatars never disagree about who's
 * logged in.
 *
 * The API's full_name falls back to the user's email when no name is set
 * (UserSerializer.get_full_name: get_full_name() or first_name or email),
 * so it's guarded here rather than read directly.
 */
export function useDisplayIdentity() {
  const { user } = useAuth();
  const { data: settings } = useSettings();

  const email = user?.email || settings?.account_email || "";
  const resolvedName = user?.full_name?.trim() || settings?.account_display_name?.trim() || "";
  const name = resolvedName && resolvedName !== email ? resolvedName : "System Administrator";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return { name, email, initials };
}
