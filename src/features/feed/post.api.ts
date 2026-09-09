import axios from "axios";
import { PostPageResponseSchema, type PostPageResponse } from "./post.schema";

export async function fetchPostsPage(
    page: number,
    limit: number,
    signal: AbortSignal
): Promise<PostPageResponse> {
    const response = await axios.get("/posts", {
        params: { page, limit },
        signal,
    });

    const parsed = PostPageResponseSchema.safeParse(response.data);
    if (!parsed.success) {
        console.error(parsed.error.format());
        throw new Error("Invalid posts response");
    }
    return parsed.data;
}