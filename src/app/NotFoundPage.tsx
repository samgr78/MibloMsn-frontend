import { Link } from "react-router-dom";
import { EmptyState } from "../shared/ui/Feedback/EmptyState";
import { Window } from "../shared/ui/Window/Window";

export function NotFoundPage() {
  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: 16 }}>
      <div style={{ width: "min(420px, 100%)" }}>
        <Window title="Page introuvable" icon="🔍">
          <EmptyState
            variant="not-found"
            title="Cette page n'existe pas"
            message="Le lien est peut-être erroné, ou la page a été supprimée."
            action={<Link to="/feed">Retourner au fil d'actualité</Link>}
          />
        </Window>
      </div>
    </main>
  );
}
