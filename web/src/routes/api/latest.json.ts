import { getLatestArticle } from '$api/getAllExternalArticles';
import { getLatestCourse } from '$api/getEggheadCourses';
import { getLatest } from '$api/getPodcast';
import { getLatestPost } from '$api/getPosts';
import type { Latest } from '$lib/types';

export async function get() {
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
