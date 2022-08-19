import type { ContentElement, Latest } from '$lib/types';
import { getLatestArticle } from '$api/getAllExternalArticles';
import { getLatestCourse } from '$api/getEggheadCourses';
import { getLatest } from '$api/getPodcast';
import { getLatestPost } from '$api/getPosts';
import getFavorites from '$api/getFavorites';

async function getLatestContent() {
	try {
		const cafeConTech = await getLatest('https://anchor.fm/s/a1ac9eb8/podcast/rss');

		/* Control remoto have a different url structure */
		const controlRemoto = await getLatest('https://anchor.fm/s/5cfb84c8/podcast/rss');

		/*****/
		const post = await getLatestPost();
		console.log({ post });
		const course = await getLatestCourse();
		const article = await getLatestArticle();

		const latest: Latest[] = [
			{
				/* egghead */ href: course.url,
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
				/* post */ href: `/blog/post/${post.slug}`,
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

		return latest;
	} catch (e) {
		console.error(e);
		// @TODO Should it Throw?
		return [];
	}
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, context }) {
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
}
