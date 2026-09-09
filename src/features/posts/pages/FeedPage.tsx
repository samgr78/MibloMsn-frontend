import { useAuth } from "../../auth/hooks/useAuth";
import { Window } from "../../../shared/ui/Window/Window";

// Placeholder screen: gives the post-login redirect somewhere to land.
export function FeedPage() {
  const { session } = useAuth();

  return (
    <Window title="Fil d'actualité" icon="💬">
      <p>Connecté en tant que {session?.user.username}.</p>
    </Window>
  );
}
