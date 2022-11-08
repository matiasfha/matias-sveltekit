import type { PageServerLoad } from './$types';
import getPosts from '$lib/api/getPosts';
import { Courses } from '$lib/api/getEggheadCourses';

import { client, builder } from '$lib/utils/sanityClient';
import { Articles } from '$lib/api/getAllExternalArticles';

async function getCourses(lang: string, tag: string) {
	const courses = await client
		.fetch(
			`*[_type == "egghead-courses" && language match "${lang}" && category match "${tag}"] | order(updated_at desc)`
		)
		.then((result) => Courses.parse(result));
	return courses.map((item) => ({ ...item, image: builder.image(item.image).url() }));
}

async function getArticles(lang: string, tag: string) {
	const query = `*[_type == "external-articles" && category match '${tag}' && language match "${lang}"] | order(_createdAt desc){
		url, title, image, published_at, tag, featured, description
	}`;
	const articles = await client.fetch(query).then((result) => Articles.parse(result));
	return articles.map((item) => {
		return {
			...item,
			image: builder.image(item.image).url()
		};
	});
}

export const load: PageServerLoad = async ({ params, cookies }) => {
	const lang = cookies.get('lang') ?? 'en';
	const { tag } = params;
	const posts = await getPosts(lang);
	const courses = await getCourses(lang, tag);
	const articles = await getArticles(lang, tag);
	return {
		posts: posts.filter((item) => item.tag?.toLowerCase() === tag),
		courses,
		articles
	};
};
