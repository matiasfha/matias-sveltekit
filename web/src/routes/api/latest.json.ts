import { getLatestArticle } from '$lib/data/getAllExternalArticles';
import { getLatestCourse } from '$lib/data/getEggheadCourses';
import { getLatest } from '$lib/data/getPodcast';
import { getLatestPost } from '$lib/data/getPosts';
import type { Latest } from 'src/types';

export async function get() {
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
	console.log(post);
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
}
