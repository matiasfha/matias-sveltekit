// import { isValidSignature } from '@sanity/webhook';
import { writeToMedium } from '$lib/utils/writeToMedium';
import writeToDevTo from '$lib/utils/writeToDevTo';
import writeToHashnode from '$lib/utils/writeToHashnode';
import { generateMarkdown } from '$lib/utils/generateMarkdown';
import { client, builder } from '$lib/utils/sanityClient';

export async function repost() {
	const { markdown, ...post } = await getLastPostMarkdown();
	await writeToDevTo({ ...post, image: builder.image(post.banner.asset._ref).url() }),
		await writeToHashnode({
			...post,
			image: builder.image(post.banner.asset._ref).url()
		}),
		await writeToMedium(post);
}

export async function validateWebhook(request: Request, body: Request['body']) {
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

export async function getLastPostMarkdown() {
	const post = await client.fetch('*[_type == "posts"] | order(_createdAt desc)[0]');
	const markdown = generateMarkdown({
		date: post._createdAt,
		banner: builder.image(post.banner.asset._ref).url(),
		keywords: post.keywords,
		title: post.title,
		description: post.description,
		bannerCredit: post.banner.bannerCredit,
		content: post.content
	});
	return {
		markdown,
		...post
	};
}
