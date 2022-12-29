//import type { Post } from '$lib/types';
import z from 'zod';
export const Post = z.lazy(() =>
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

export const Posts = z.array(Post);

export default async function getPosts(lang?: string) {
	const modules = import.meta.glob(`../../routes/blog/post/**/+page.svx`);

	const postPromises = [];
	for (const [path, resolver] of Object.entries(modules)) {
		const promise = resolver().then((post) => {
			const slug = path.slice(12, -10);
			return {
				slug: slug
					.normalize('NFD')
					.replace(/[\u0300-\u036f]/g, '')
					//eslint-disable-next-line
					.replace(/\?|\¿/g, ''),
				//@ts-expect-error Metada cannot be infered
				...post.metadata,
				html: post.default.render?.().html,
				path: path.slice(0, -4).slice(9)
			};
		});
		postPromises.push(promise);
	}

	const res = await Promise.all(postPromises).then((p) => {
		return Posts.parse(p);
	});

	const posts = res.sort((a, b) => {
		const aDate = new Date(a.date).getTime();
		const bDate = new Date(b.date).getTime();
		return aDate < bDate ? 1 : -1;
	});
	if (lang) {
		return posts.filter((item) => item.lang === lang);
	}
	return posts;
}

export async function getLatestPost(lang?: string) {
	const posts = await getPosts(lang);

	return posts[0];
}
