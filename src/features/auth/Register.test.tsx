import { HttpResponse, http } from 'msw'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import { server } from '../../test/server.ts'
import Register from './Register.tsx'

describe('Register', () => {
  test('affiche la validation front champ par champ', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Register /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: 'Create my account' }))

    expect(screen.getByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Username is required.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
  })

  test('associe une erreur API au bon champ', async () => {
    server.use(http.post('*/auth/register', () =>
      HttpResponse.json({ error: 'Username already used', field: 'username' }, { status: 409 })))
    const user = userEvent.setup()
    render(<MemoryRouter><Register /></MemoryRouter>)

    await user.type(screen.getByLabelText('E-mail address:'), 'alice@example.com')
    await user.type(screen.getByLabelText('Username:'), 'alice')
    await user.type(screen.getByLabelText('Password:'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Create my account' }))

    expect(await screen.findByText('Username already used')).toHaveAttribute('id', 'username-error')
  })
})
