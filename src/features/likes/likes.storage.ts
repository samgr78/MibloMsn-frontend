import { z } from 'zod'

const StoredPostIdsSchema = z.array(z.string())

function getStorageKey(): string {
  const username = localStorage.getItem('username') ?? 'anonymous'
  return `liked-posts:${username}`
}

function readLikedPostIds(): string[] {
  const storedValue = localStorage.getItem(getStorageKey())
  if (!storedValue) {
    return []
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue)
    const result = StoredPostIdsSchema.safeParse(parsedValue)
    return result.success ? result.data : []
  } catch {
    return []
  }
}

export function hasStoredLike(postId: string): boolean {
  return readLikedPostIds().includes(postId)
}

export function storeLike(postId: string, isLiked: boolean): void {
  const likedPostIds = new Set(readLikedPostIds())

  if (isLiked) {
    likedPostIds.add(postId)
  } else {
    likedPostIds.delete(postId)
  }

  localStorage.setItem(getStorageKey(), JSON.stringify([...likedPostIds]))
}
