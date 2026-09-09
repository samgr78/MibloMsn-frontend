import { z } from "zod";

export const PostSchema = z.object({
    id: z.string(),
    content: z.string(),
    imageUrl: z.string().url().nullable(),
    createdAt: z.string(),
    author: z.object({
        id: z.string(),
        username: z.string(),
    }),
});

export const PostPageResponseSchema = z.object({
    posts: z.array(PostSchema),
    totalPages: z.number(),
});

export type Post = z.infer<typeof PostSchema>;
export type PostPageResponse = z.infer<typeof PostPageResponseSchema>;