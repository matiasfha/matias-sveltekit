import type { PageServerLoad } from './$types';
import { getLatestArticle } from '$lib/api/getAllExternalArticles';
import getCourses, { getLatestCourse } from '$lib/api/getEggheadCourses';
import { getLatest } from '$lib/api/getPodcast';
import { getLatestPost } from '$lib/api/getPosts';
import getFavorites from '$lib/api/getFavorites';
import { locale } from '$lib/translations';
import { redirect } from '@sveltejs/kit';

async function getLatestContent(lang: string) {
	try {
		const post = await getLatestPost(lang);

		const course = await getLatestCourse(lang);
		const article = await getLatestArticle(lang);

		let latest = [
			{
				/* egghead */ href: course.url + '?af=4cexzz',
				image: course.image,
				title: course.title,
				tag: 'Egghead Course'
			},
			{
				/* post */ href: post.slug,
				image: post.banner,
				title: post.title,
				tag: 'Post'
			},
			{
				/* article*/
				href: article.url,
				image: article.image,
				title: article.title,
				tag: `published at: ${article.tag}`
			}
		];
		if (lang === 'es') {
			const cafeConTech = await getLatest('https://anchor.fm/s/a1ac9eb8/podcast/rss');

			/* Control remoto have a different url structure */
			const controlRemoto = await getLatest('https://anchor.fm/s/5cfb84c8/podcast/rss');
			latest = [
				...latest,
				{
					/* Cafe con Tech*/
					href: cafeConTech.url,
					image: cafeConTech.image,
					title: cafeConTech.title,
					tag: 'Podcast: Café con Tech'
				},
				{
					/* Control Remoto*/
					href: controlRemoto.url,
					image: controlRemoto.image,
					title: controlRemoto.title,
					tag: 'Podcast: Control Remoto'
				},
				/* youtube */
				{
					href: 'https://youtu.be/v3WUL7gK9Kw',
					image:
						'https://res.cloudinary.com/matiasfha/image/upload/v1662082980/web3-youtube_xqpfxj.png',
					title: 'Web3: Fullstack Development con Ethereum y SvelteKit',
					tag: `Youtube Video`
				}
			];
		}

		return latest;
	} catch (e) {
		console.error(e);
		// @TODO Should it Throw?
		return [];
	}
}

export const load: PageServerLoad = async ({ cookies }) => {
	try {
		const lang = cookies.get('lang') ?? 'en';
		const latest = await getLatestContent(lang);
		const favorites = await getFavorites(lang);
		const featured = (await getCourses(lang)).find((item) => item.featured);

		return {
			latest,
			favorites,
			featured
		};
	} catch (e) {
		console.error(e);
		return {
			status: 500,
			errors: {
				error: new Error(e.message)
			}
		};
	}
};

export const actions = {
	setLang: async ({ cookies, request }) => {
		const data = await request.formData();
		const lang = data.get('lang');
		const location = data.get('location');
		locale.set(lang);
		cookies.set('lang', lang, { path: '/' });
		if (location) {
			throw redirect(303, location);
		}
		return {
			success: true
		};
	}
};
