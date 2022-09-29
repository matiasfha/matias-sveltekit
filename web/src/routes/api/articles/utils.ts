import sanityClient from '@sanity/client';
import { isValidSignature } from '@sanity/webhook';
import type { Posts, Documents } from '../../../../schema.types';

import imageUrlBuilder from '@sanity/image-url';

import { writeToMedium } from '$lib/utils/writeToMedium';
import writeToDevTo from '$lib/utils/writeToDevTo';
import writeToHashnode from '$lib/utils/writeToHashnode';
import { createClient } from 'sanity-codegen';
import { generateMarkdown } from '$lib/utils/generateMarkdown';

const clientOptions = {
	projectId: 'cyypawp1',
	dataset: 'production',
	fetch,
	apiVersion: '2022-06-23', // use current UTC date - see "specifying API version"!
	token: '', // or leave blank for unauthenticated usage
	useCdn: true // `false` if you want to ensure fresh data
};

const client = createClient<Documents>(clientOptions);
const builder = imageUrlBuilder(sanityClient(clientOptions));

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

	return isValidSignature(
		JSON.stringify(body),
		headers['sanity-webhook-signature'],
		import.meta.env.VITE_SANITY_SECRET
	);
}

export async function getLastPostMarkdown() {
	const [post] = await client.query<Posts>('*[_type == "posts"] | order(_createdAt desc)');
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
