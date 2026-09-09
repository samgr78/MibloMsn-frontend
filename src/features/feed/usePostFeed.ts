import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { fetchPostsPage } from "./post.api";
import type { Post } from "./post.schema";

type FeedState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "empty" }
    | { status: "success"; posts: Post[]; totalPages: number };

export function usePostFeed(page: number, limit: number): FeedState {
    const [state, setState] = useState<FeedState>({ status: "loading" });
    const hasLoadedOnce = useRef(false);

    useEffect(() => {
        const controller = new AbortController();
        if (!hasLoadedOnce.current) {
            setState({ status: "loading" });
        }

        fetchPostsPage(page, limit, controller.signal)
            .then((response) => {
                hasLoadedOnce.current = true;
                setState(
                    response.posts.length === 0
                        ? { status: "empty" }
                        : { status: "success", posts: response.posts, totalPages: response.totalPages }
                );
            })
            .catch((error: unknown) => {
                if (axios.isCancel(error)) return;
                setState({ status: "error", message: "Impossible de charger le fil" });
            });

        return () => controller.abort();
    }, [page, limit]);

    return state;
}