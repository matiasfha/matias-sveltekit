import { getLatestArticle } from '$api/getAllExternalArticles';
import { getLatestCourse } from '$api/getEggheadCourses';
import { getLatest } from '$api/getPodcast';
import { getLatestPost } from '$api/getPosts';
import type { Latest } from '$lib/types';

export async function get() {
	try {
		const cafeConTech = await getLatest('1081172', 'https://www.cafecon.tech');

		/* Control remoto have a different url structure */
		const controlRemoto = await getLatest('1057351', 'https://www.controlremoto.io');
		let path = controlRemoto.title;
		if (controlRemoto.title.includes(':')) {
			path = controlRemoto.title.split(':')[1].trim();
		}
		controlRemoto.url = path.toLowerCase().replace(',', '').split(' ').join('-');
		/*****/
		const post = await getLatestPost();
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
				/* Cafe con Tech*/ href: cafeConTech.url,
				image: cafeConTech.image,
				title: cafeConTech.title,
				tag: 'Podcast: Café con Tech'
			},
			{
				/* Control Remoto*/ href: `https://controlremoto.io/episodios/${controlRemoto.url}`,
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

		return {
			body: latest
		};
	} catch (e) {
		console.error(e);
		return {
			status: 500,
			body: e.message
		};
	}
}
