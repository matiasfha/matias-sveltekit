import { writeToMedium } from '$lib/utils/writeToMedium';
import writeToDevTo from '$lib/utils/writeToDevTo';
import writeToHashnode from '$lib/utils/writeToHashnode';
import { client, builder } from '$lib/utils/sanityClient';

import z from 'zod';
export const Post = z.lazy(() =>
	z
		.object({
			_createdAt: z.string(),
			banner: z.object({
				asset: z.object({
					_ref: z.string()
				})
			}),
			keywords: z.array(z.string()),
			title: z.string(),
			description: z.string(),
			article: z.string(),
			language: z.array(z.string()),
			_type: z.literal('posts')
		})
		.transform((post) => ({
			date: post._createdAt,
			banner: builder.image(post.banner.asset._ref).url(),
			keywords: post.keywords,
			title: post.title,
			description: post.description,
			content: post.article,
			lang: post.language.includes('es') ? 'es' : ('en' as 'en' | 'es')
		}))
);

export async function repost(post: z.infer<typeof Post>) {
	return Promise.allSettled([
		writeToDevTo({ ...post, image: post.banner }),
		writeToHashnode({
			...post,
			image: post.banner
		}),
		writeToMedium(post)
	]);
}

export async function getLastPostMarkdown() {
	const post = await client
		.fetch('*[_type == "posts"] | order(_createdAt desc)[0]')
		.then((p) => Post.parse(p));
	const markdown = post.content;
	return {
		markdown,
		...post
	};
}
