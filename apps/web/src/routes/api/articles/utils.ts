// import { isValidSignature } from '@sanity/webhook';
import { writeToMedium } from '$lib/utils/writeToMedium';
import writeToDevTo from '$lib/utils/writeToDevTo';
import writeToHashnode from '$lib/utils/writeToHashnode';
import { generateMarkdown } from '$lib/utils/generateMarkdown';
import { client, builder } from '$lib/utils/sanityClient';
import z from 'zod';

const Post = z
	.object({
		_createdAt: z.string(),
		banner: z.object({
			asset: z
				.object({
					_ref: z.string()
				})
				.nullable()
		}),
		keywords: z.array(z.string()),
		title: z.string(),
		description: z.string(),
		content: z.array(z.record(z.any())),
		language: z.union([z.literal('es'), z.literal('en')])
	})
	.transform((val) => ({
		...val,
		banner: builder.image(val.banner.asset._ref).url(),
		lang: val.language
	}));

export async function repost(): Promise<void> {
	//eslint-disable-next-line
	const { markdown, ...post } = await getLastPostMarkdown();
	await writeToDevTo({ ...post, image: post.banner });
	await writeToHashnode({
		...post,
		image: post.banner
	});
	await writeToMedium(post);
}

export async function validateWebhook(request: Request): Promise<boolean> {
	const headers = {};

	request.headers.forEach((value, key) => {
		headers[key] = value;
	});

	// return isValidSignature(
	// 	JSON.stringify(body),
	// 	headers['sanity-webhook-signature'],
	// 	import.meta.env.VITE_SANITY_SECRET
	// );
	return headers['sanity-webhook-signature'] === import.meta.env.VITE_SANITY_SECRET;
}

export async function getLastPostMarkdown(): Promise<{ markdown: string } & z.infer<typeof Post>> {
	const post = await client
		.fetch('*[_type == "posts"] | order(_createdAt desc)[0]')
		.then((p) => Post.parse(p));
	const markdown = generateMarkdown({
		date: post._createdAt,
		banner: post.banner,
		keywords: post.keywords,
		title: post.title,
		description: post.description,
		content: post.content,
		lang: post.lang
	});
	return {
		markdown,
		...post
	};
}
