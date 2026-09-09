import { LikeButton } from "../../likes/components/LikeButton";
import type { Post } from "../api/posts.schemas";
import { DeletePostButton } from "./DeletePostButton";

type PostActionsProps = {
  post: Post;
  /** Passed by the detail page, which must leave the deleted post's URL. */
  onDeleted?: () => void;
};

/** What you can do with a post, defined once for the three screens that
 *  show one. A new action added here appears everywhere at once. */
export function PostActions({ post, onDeleted }: PostActionsProps) {
  return (
    <>
      <LikeButton post={post} />
      <DeletePostButton post={post} {...(onDeleted === undefined ? {} : { onDeleted })} />
    </>
  );
}
