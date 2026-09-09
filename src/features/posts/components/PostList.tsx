import type { ReactNode } from "react";
import { List } from "../../../shared/ui/List/List";
import type { Post } from "../api/posts.schemas";
import { PostCard, type PostCardVariant } from "./PostCard";

type PostListProps = {
  posts: ReadonlyArray<Post>;
  variant?: PostCardVariant;
  label?: string;
  renderActions?: (post: Post) => ReactNode;
};

export function PostList({ posts, variant = "feed", label, renderActions }: PostListProps) {
  return (
    <List
      items={posts}
      keyOf={(post) => post.id}
      gap="md"
      {...(label === undefined ? {} : { label })}
      renderItem={(post) => (
        <PostCard post={post} variant={variant} actions={renderActions?.(post)} />
      )}
    />
  );
}
