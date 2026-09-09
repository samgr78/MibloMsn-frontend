import { type ReactElement, useState } from "react";
import { usePostFeed } from "./usePostFeed";
import { PostCard } from "../../shared/components/PostCard";

const ITEMS_PER_PAGE = 20;

function PostFeed(): ReactElement {
    const [currentPage, setCurrentPage] = useState(1);
    const state = usePostFeed(currentPage, ITEMS_PER_PAGE);

    switch (state.status) {
        case "loading":
            return <p>Chargement du fil...</p>;

        case "error":
            return <p role="alert">{state.message}</p>;

        case "empty":
            return <p>Aucun post pour le moment.</p>;

        case "success":
            return (
                <div>
                    <ul>
                        {state.posts.map((post) => (
                            <li key={post.id}>
                                <PostCard post={post} />
                            </li>
                        ))}
                    </ul>
                    <div>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                            Previous
                        </button>
                        <span>
                            {" "}
                            Page {currentPage} of {state.totalPages}{" "}
                        </span>
                        <button
                            disabled={currentPage === state.totalPages}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            );

        default: {
            const exhaustiveCheck: never = state;
            return exhaustiveCheck;
        }
    }
}
export default PostFeed;