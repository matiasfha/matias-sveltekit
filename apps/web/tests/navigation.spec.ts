import { test, expect } from '@playwright/test';

test('Navigate through the site', async ({ page }) => {
	await page.goto('/');

	await page
		.getByRole('heading', {
			name:
				"Hi!, I'm Matías Hernández. I'm a Chilean developer and I create content and help other devs to rise up in the world of web development!"
		})
		.click();

	await page.getByRole('link', { name: 'Blog' }).click();
	await expect(page).toHaveURL('/blog');

	await page
		.getByText('My writings and thoughts about Javascript, React, Typescript, Svelte, Web3, Soli')
		.click();

	await page.getByRole('link', { name: 'Understanding the Intl Javascript API' }).nth(1).click();
	await expect(page).toHaveURL('/blog/post/understanding-the-intl-javascript-api');

	await page.getByRole('heading', { name: 'Knowing the Intl Javascript API' }).click();

	await page.getByRole('link', { name: 'Guest Articles' }).click();
	await expect(page).toHaveURL('/articles');

	await page
		.getByRole('link', { name: 'podcast Clevertech Why XState is THE State Management Tool' })
		.click();
	await expect(page).toHaveURL('/articles');

	await page.getByRole('link', { name: 'Courses' }).click();
	await expect(page).toHaveURL('/courses');

	await page
		.getByText('In this course, you will find a step-by-step guide to build a complex component')
		.click();

	await page.getByRole('link', { name: 'About' }).click();
	await expect(page).toHaveURL('/about');

	await page.getByRole('heading', { name: "Hi there I'm Matías 👋" }).click();

	await page.getByRole('button', { name: 'Invite me a coffee' }).click();

	await page.getByRole('button', { name: 'What things I use' }).click();

	await page
		.locator('ul:has-text("PodcastBlogGuest ArticlesCoursesAboutSponsorshipsUses ESEN")')
		.getByRole('link', { name: 'Sponsorships' })
		.click();
	await expect(page).toHaveURL('/sponsorships');

	await page
		.getByText('Each time, more than 6000 developers visit this website to read articles, listen')
		.click();

	await page.getByRole('link', { name: 'Uses' }).click();
	await expect(page).toHaveURL('/uses');

	await page.getByRole('heading', { name: 'Que estoy usando' }).click();

	await page.locator('select[name="lang"]').selectOption('es');
	await expect(page).toHaveURL('/uses');

	await page.getByRole('link', { name: 'Newsletter' }).click();
	await expect(page).toHaveURL('/newsletter');

	await page
		.getByRole('heading', { name: '¿Aún luchas con Javascript y el desarrollo web?' })
		.click();

	await page.getByRole('link', { name: 'Blog' }).click();
	await expect(page).toHaveURL('/blog');

	await page
		.getByText('React `useEffect` es quizá el hook que más confusiones genera a la hora de utili')
		.click();
});
