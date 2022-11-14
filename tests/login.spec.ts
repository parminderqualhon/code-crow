import { test, expect } from '@playwright/test'

test('Login page has a title', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle("Code Crow")
})
