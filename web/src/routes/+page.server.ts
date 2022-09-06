import type { PageServerLoad } from './$types';
import type { Latest } from '$lib/types';
import { getLatestArticle } from '$lib/api/getAllExternalArticles';
import { getLatestCourse } from '$lib/api/getEggheadCourses';
import { getLatest } from '$lib/api/getPodcast';
import { getLatestPost } from '$lib/api/getPosts';
import getFavorites from '$lib/api/getFavorites';

async function getLatestContent() {
	try {
		const cafeConTech = await getLatest('https://anchor.fm/s/a1ac9eb8/podcast/rss');

		/* Control remoto have a different url structure */
		const controlRemoto = await getLatest('https://anchor.fm/s/5cfb84c8/podcast/rss');

		/*****/
		const post = await getLatestPost();

		const course = await getLatestCourse();
		const article = await getLatestArticle();

		const latest: Latest[] = [
			{
				/* egghead */ href: course.url + '?af=4cexzz',
				image: course.image,
				title: course.title,
				tag: 'Egghead Course'
			},
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
			/* youtube */
			{
				href: 'https://youtu.be/v3WUL7gK9Kw',
				image:
					'https://res.cloudinary.com/matiasfha/image/upload/v1662082980/web3-youtube_xqpfxj.png',
				title: 'Web3: Fullstack Development con Ethereum y SvelteKit',
				tag: `Youtube Video`
			}
		];

		return latest;
	} catch (e) {
		console.error(e);
		// @TODO Should it Throw?
		return [] as Latest[];
	}
}

/** @type {import('./$types').PageServerLoad} */
export const load: PageServerLoad = async () => {
	try {
		const latest = await getLatestContent();
		const favorites = await getFavorites();

		return {
			latest,
			favorites
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

export const prerender = true;
