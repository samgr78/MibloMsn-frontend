import type { ReactElement } from "react";
import type { Post } from "../../features/feed/post.schema";

type PostCardProps = {
    post: Post;
};

export function PostCard({ post }: PostCardProps): ReactElement {
    return (
        <article>
            <header>
                <span>{post.author.username}</span>
                <time dateTime={post.createdAt}>
                    {new Date(post.createdAt).toLocaleDateString()}
                </time>
            </header>
            <p>{post.content}</p>
            {post.imageUrl !== null && <img src={post.imageUrl} alt="" loading="lazy" />}
        </article>
    );
}