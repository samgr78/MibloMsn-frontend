import { expect, test } from '@playwright/test'

test('connexion, publication avec image et affichage immédiat dans le feed', async ({ page, request }) => {
  const content = `Publication Playwright ${Date.now()}`
  let createdPostId: string | undefined

  try {
    await page.goto('/login')
    await page.getByLabel('E-mail address:').fill('alice@test.com')
    await page.getByLabel('Password:').fill('password123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/feed$/)

    await page.getByRole('button', { name: 'Create a post' }).click()
    await page.getByLabel('Content').fill(content)
    await page.getByLabel('Image (optional)').setInputFiles('public/msn-boneco-vector-logo.png')
    await page.getByRole('button', { name: 'Publish' }).click()

    const article = page.locator('article').filter({ hasText: content })
    await expect(article).toBeVisible()
    await expect(article.locator('img.post-card-image')).toBeVisible()
    const detailPath = await article.locator('a.post-card-detail-link').getAttribute('href')
    createdPostId = detailPath?.split('/').at(-1)
    expect(createdPostId).toBeTruthy()
  } finally {
    if (createdPostId) {
      const token = await page.evaluate(() => localStorage.getItem('token'))
      if (token) {
        await request.delete(`http://127.0.0.1:3000/posts/${createdPostId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    }
  }
})
