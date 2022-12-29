import { test, expect } from '@playwright/test';

test('Test if frontpage loads', async ({ page }) => {
	await page.goto('/');
  await expect(page).toHaveTitle('Matias Hernández Website')
  const h1 = page.getByRole('heading',{ level: 1})
  await expect(h1).toHaveText("Hi!, I'm Matías Hernández. I'm a Chilean developer and I create content and help other devs to rise up in the world of web development!")

});
