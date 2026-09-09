import { api } from '../../api/axios.tsx'
import { PostPageResponseSchema, type PostPageResponse } from './post.schema.ts'

export async function fetchPostsPage(
    page: number,
    limit: number,
    signal: AbortSignal,
): Promise<PostPageResponse> {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Authentication is required to load the feed')
  }

  const { data }: { data: unknown } = await api.get<unknown>('/posts', {
    params: { page, limit },
    signal,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const parsedResponse = PostPageResponseSchema.safeParse(data)
  if (!parsedResponse.success) {
    throw new Error('Invalid posts response')
  }

  return parsedResponse.data
}
