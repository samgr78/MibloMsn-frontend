import { HttpResponse, http } from 'msw'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { feedPost } from '../../test/handlers.ts'
import { server } from '../../test/server.ts'
import { LikeButton } from './LikeButton.tsx'

describe('LikeButton', () => {
  test('met à jour immédiatement puis revient en arrière si l’API échoue', async () => {
    let releaseRequest: (() => void) | undefined
    const requestGate = new Promise<void>((resolve) => {
      releaseRequest = resolve
    })
    server.use(http.post('*/posts/post-1/like', async () => {
      await requestGate
      return HttpResponse.json({ error: 'Like unavailable' }, { status: 500 })
    }))
    localStorage.setItem('token', 'test-token')
    const user = userEvent.setup()
    render(<LikeButton post={feedPost} />)
    const button = screen.getByRole('button', { name: 'Like this post' })

    await user.click(button)
    expect(within(button).getByText('3')).toBeInTheDocument()

    releaseRequest?.()
    expect(await screen.findByRole('alert')).toHaveTextContent('Like unavailable')
    expect(within(button).getByText('2')).toBeInTheDocument()
  })
})
