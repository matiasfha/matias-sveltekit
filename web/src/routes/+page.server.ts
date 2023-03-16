import type { PageServerLoad } from './$types';
import { getLatestArticle } from '$lib/api/getAllExternalArticles';
import getCourses, { getLatestCourse } from '$lib/api/getEggheadCourses';
import { getLatest } from '$lib/api/getPodcast';
import { getLatestPost } from '$lib/api/getPosts';
import getFavorites from '$lib/api/getFavorites';
import { locale } from '$lib/translations';
import { redirect } from '@sveltejs/kit';
import { getVideos } from '$lib/api/getYoutubeChannel';

async function getLatestContent(lang?: string) {
	try {
		const postP = getLatestPost(lang);

		const courseP = getLatestCourse(lang);
		const articleP = getLatestArticle(lang);
		const cafeConTechP = getLatest('https://anchor.fm/s/a1ac9eb8/podcast/rss');
		const youtubeP = getVideos();
		let promises = [postP, courseP, articleP, cafeConTechP, youtubeP];
		// if (lang === 'es') {
		// 	const controlRemotoP = getLatest('https://anchor.fm/s/5cfb84c8/podcast/rss');
		// }
		const [post, course, article, cafeConTech, youtube] = await Promise.all(promises);
		let latest = [
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
			},
			{
				/* Cafe con Tech*/
				href: cafeConTech.url,
				image: cafeConTech.image,
				title: cafeConTech.title,
				tag: 'Podcast: Café con Tech'
			},
			{
				href: 'https://youtube.com/watch?v=' + youtube[0].id,
				image: youtube[0].thumb.url,
				title: youtube[0].title,
				tag: `Youtube`
			},
			{
				/* egghead */ href: course.url + '?af=4cexzz',
				image: course.image,
				title: course.title,
				tag: 'Egghead Course'
			}
		];
		if (lang === 'es') {
			const controlRemoto = await getLatest('https://anchor.fm/s/5cfb84c8/podcast/rss');
			latest = [
				...latest,
				{
					/* Control Remoto*/
					href: controlRemoto.url,
					image: controlRemoto.image,
					title: controlRemoto.title,
					tag: 'Podcast: Control Remoto'
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
		const lang = cookies.get('lang');

		const latestP = getLatestContent(lang);
		const favoritesP = getFavorites(lang);
		const featuredP = getCourses(lang);
		// const featuredP = (await getCourses(lang)).find((item) => item.featured);
		const [latest, favorites, courses] = await Promise.all([latestP, favoritesP, featuredP]);
		const featured = courses.find((item) => item.featured);
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

export const config = {
	isr: {
		expiration: 60
	}
};
