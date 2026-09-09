import { api } from '../../api/axios.tsx'
import { PostPageResponseSchema, type PostPageResponse } from './post.schema.ts'

export async function fetchPostsPage(
    page: number,
    limit: number,
    signal: AbortSignal,
): Promise<PostPageResponse> {
  const { data }: { data: unknown } = await api.get<unknown>('/posts', {
    params: { page, limit },
    signal,
  })

  const parsedResponse = PostPageResponseSchema.safeParse(data)
  if (!parsedResponse.success) {
    throw new Error('Invalid posts response')
  }

  return parsedResponse.data
}
