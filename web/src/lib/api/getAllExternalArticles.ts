import z from 'zod';
import { client, builder } from '$lib/utils/sanityClient';

const Article = z.object({
	url: z.string(),
	title: z.string(),
	image: z.object({
		asset: z.object({
			_ref: z.string()
		})
	}),
	published_at: z.string().nullable(),
	tag: z.string(),
	featured: z.boolean().nullable(),
	description: z.string().nullable()
});

export const Articles = z.array(Article);

const getQuery = (lang: string) =>
	`*[_type == "external-articles" && language match "${lang}"] | order(_createdAt desc){
		url, title, image, published_at, tag, featured, description
	}`;
export default async function getArticles(lang: string) {
	try {
		const articles = await client.fetch(getQuery(lang)).then((result) => {
			return Articles.parse(result);
		});

		return articles.map((item) => {
			return {
				...item,
				image: builder.image(item.image).url()
			};
		});
	} catch (e) {
		console.error(e);
		return [];
	}
}

export async function getLatestArticle(lang: string) {
	const query = getQuery(lang);
	const article = await client.fetch(`${query}[0]`).then((result) => Article.parse(result));
	return { ...article, image: builder.image(article.image).url() };
}
