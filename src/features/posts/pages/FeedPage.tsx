import { EmptyState } from "../../../shared/ui/Feedback/EmptyState";
import { LikeButton } from "../../likes/components/LikeButton";
import { CreatePostForm } from "../components/CreatePostForm";
import { PostStream } from "../components/PostStream";
import { useFeed } from "../hooks/useFeed";
import styles from "./FeedPage.module.css";

export function FeedPage() {
  const feed = useFeed();

  return (
    <div className={styles.page}>
      <h1>Fil d'actualité</h1>

      <CreatePostForm />

      <PostStream
        query={feed}
        label="Fil d'actualité"
        renderActions={(post) => <LikeButton post={post} />}
        empty={
          <EmptyState
            title="Aucun post pour le moment"
            message="Soyez le premier à publier quelque chose."
          />
        }
      />
    </div>
  );
}
