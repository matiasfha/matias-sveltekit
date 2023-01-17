//import type { Post } from '$lib/types';
import { isAfter, parseISO } from 'date-fns';
import z from 'zod';
const Post = z.lazy(() =>
	z.object({
		date: z.string(),
		banner: z.string(),
		keywords: z.array(z.string()),
		title: z.string(),
		description: z.string(),
		tag: z.string().optional(),
		slug: z.string(),
		featured: z.boolean().optional(),
		path: z.string(),
		similarPosts: z.array(Post).optional(),
		filepath: z.string().optional(),
		html: z.string().optional(),
		rawContent: z.string().optional(),
		readingTime: z.object({
			text: z.string()
		}),
		lang: z.string()
	})
);

const MetaData = z.lazy(() =>
	z.object({
		date: z.string(),
		banner: z.string(),
		keywords: z.array(z.string()),
		title: z.string(),
		description: z.string(),
		bannerCredit: z.string().nullable().optional(),
		tag: z.string().optional().default('General'),
		readingTime: z.object({
			text: z.string(),
			minutes: z.number(),
			time: z.number(),
			words: z.number()
		}),
		filepath: z.string(),
		canonical: z.string(),
		lang: z.string().default('es'),
		toc: z.string()
	})
);

export const Posts = z.array(Post);

export default async function getPosts(lang?: string, limitDate?: Date | null) {
	const modules = import.meta.glob(`../../routes/blog/post/**/+page.svx`);

	const postPromises = [];

	for (const [path, resolver] of Object.entries(modules)) {
		const promise = resolver().then((post) => {
			const slug = path.slice(12, -10);
			// const metadata = MetaData.parse(post.metadata)
			return {
				slug: slug
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.replace(/\?|\¿/g, ''),
				...post.metadata,
				html: post.default.render?.().html,
				path: path.slice(0, -4).slice(9)
			};
		});

		postPromises.push(promise);
	}

	const res = await Promise.all(postPromises); //.then((p) => {console.log(p); return Posts.parse(p)});

	const posts = res.filter(post => {
		if(limitDate) {
			return isAfter(parseISO(post.date), limitDate)
		}
		return post
	}).sort((a, b) => {
		const aDate = new Date(a.date).getTime();
		const bDate = new Date(b.date).getTime();
		return aDate < bDate ? 1 : -1;
	});
	if (lang) {
		return posts.filter((item) => item.lang === lang);
	}
	return posts;
}

export async function getLatestPost(lang?: string): Promise<z.infer<typeof Post>>{
	const posts = await getPosts(lang);

	return posts[0];
}
