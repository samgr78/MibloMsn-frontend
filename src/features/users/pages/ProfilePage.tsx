import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../../shared/api/ApiError";
import { formatAbsoluteDate } from "../../../shared/lib/formatDate";
import { toScreenState } from "../../../shared/screen-state/screenState";
import { ScreenStateView } from "../../../shared/screen-state/ScreenStateView";
import { Avatar } from "../../../shared/ui/Avatar/Avatar";
import { EmptyState } from "../../../shared/ui/Feedback/EmptyState";
import { Window } from "../../../shared/ui/Window/Window";
import { useAuth } from "../../auth/hooks/useAuth";
import { PostActions } from "../../posts/components/PostActions";
import { PostStream } from "../../posts/components/PostStream";
import { useUserPosts } from "../../posts/hooks/useFeed";
import { useUser } from "../hooks/useUser";
import styles from "./ProfilePage.module.css";

function NotFound() {
  return (
    <EmptyState
      variant="not-found"
      title="Ce profil n'existe pas"
      message="Le compte a peut-être été supprimé."
      action={<Link to="/feed">Retourner au fil d'actualité</Link>}
    />
  );
}

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { session } = useAuth();

  // Both requests go out in parallel: chaining them would only add latency.
  const user = useUser(userId ?? "");
  const posts = useUserPosts(userId ?? "");

  const isMe = session !== null && session.user.id === userId;

  if (userId === undefined) {
    return <NotFound />;
  }

  // A missing account is an absence, not a failure: no Retry button.
  if (ApiError.is(user.error) && user.error.status === 404) {
    return <NotFound />;
  }

  return (
    <div className={styles.page}>
      <ScreenStateView state={toScreenState(user)}>
        {(profile) => (
          <>
            <Window variant="panel" title="Profil" icon="👤">
              <div className={styles.identity}>
                <Avatar
                  username={profile.username}
                  size="lg"
                  {...(isMe ? { status: "online" as const } : {})}
                />

                <div className={styles.details}>
                  <h1 className={styles.username}>{profile.username}</h1>
                  <p className={styles.since}>
                    Membre depuis le {formatAbsoluteDate(new Date(profile.createdAt))}
                  </p>
                  {isMe ? <p className={styles.badge}>C'est vous</p> : null}
                </div>
              </div>
            </Window>

            <PostStream
              query={posts}
              variant="profile"
              label={`Posts de ${profile.username}`}
              renderActions={(post) => <PostActions post={post} />}
              empty={
                <EmptyState
                  title={
                    isMe ? "Vous n'avez rien publié" : `${profile.username} n'a rien publié`
                  }
                  message={
                    isMe
                      ? "Vos publications apparaîtront ici."
                      : "Repassez plus tard, ce profil est encore vide."
                  }
                />
              }
            />
          </>
        )}
      </ScreenStateView>
    </div>
  );
}
