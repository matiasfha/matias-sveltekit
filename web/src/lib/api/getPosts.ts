//import type { Post } from '$lib/types';
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
		})
	})
);

export const Posts = z.array(Post);

export default async function getPosts(lang: string): Promise<Post[]> {
	let enModules = import.meta.glob(`../../routes/blog/post/en/**/+page.svx`);
	let esModules = import.meta.glob(`../../routes/blog/post/es/**/+page.svx`);
	const modules = lang === 'en' ? enModules : esModules;

	const postPromises = [];
	for (const [path, resolver] of Object.entries(modules)) {
		const promise = resolver().then((post) => {
			const slug = path.slice(12, -10);
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

	const res = await Promise.all(postPromises).then((p) => Posts.parse(p));

	const posts = res.sort((a, b) => {
		const aDate = new Date(a.date).getTime();
		const bDate = new Date(b.date).getTime();
		return aDate < bDate ? 1 : -1;
	});
	return posts;
}

export async function getLatestPost(lang: string) {
	const posts = await getPosts(lang);

	return posts[0];
}
