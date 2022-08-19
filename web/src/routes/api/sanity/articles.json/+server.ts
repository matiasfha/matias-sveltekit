import sanityClient from '@sanity/client';
import { isValidSignature } from '@sanity/webhook';
import type { RequestEvent } from './$types';
import type { Posts } from '../../../../schema.types';

import imageUrlBuilder from '@sanity/image-url';

import { createFileInRepo, updateFileInRepo } from '$lib/utils/github';
import { writeToMedium } from '$api/writeToMedium';
import writeToDevTo from '$api/writeToDevTo';
import writeToHashnode from '$api/writeToHashnode';
import { createClient } from 'sanity-codegen';
import type { Documents } from '../../../../schema.types';
import { generateMarkdown } from '$api/generateMarkdown';

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

async function writePost(post: Posts, update = false) {
	const markdown = generateMarkdown({
		date: post._createdAt,
		banner: builder.image(post.banner.asset._ref).url(),
		keywords: post.keywords,
		title: post.title,
		description: post.description,
		bannerCredit: post.banner.bannerCredit,
		content: post.content
	});

	let promises = [];
	if (!update) {
		promises = [
			await createFileInRepo(markdown, post.title),
			await writeToDevTo({ ...post, image: builder.image(post.banner.asset._ref).url() }),
			await writeToHashnode({
				...post,
				image: builder.image(post.banner.asset._ref).url()
			}),
			await writeToMedium(post)
		];
	} else {
		promises = [await createFileInRepo(markdown, post.title)];
	}

	try {
		const res = await Promise.all(promises);
		return {
			github: res[0] ?? null,
			dev: res[1] ?? null,
			hashnode: res[2] ?? null,
			medium: res[3] ?? null
		};
	} catch (e) {
		return {
			github: null,
			dev: null,
			hashnode: null,
			medium: null,
			error: e
		};
	}
}

async function generateContent(update = false) {
	try {
		const [post] = await client.query<Posts>('*[_type == "posts"] | order(_createdAt desc)');

		const { github, hashnode, dev, medium } = await writePost(post, update);

		return new Response(JSON.stringify({ github, hashnode, dev, medium }));
	} catch (e) {
		console.error(e);
		return {
			status: 500,
			body: e.message
		};
	}
}

async function validateWebhook(request: Request, body: Request['body']) {
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

export async function PUT({ request }: RequestEvent) {
	const body = await request.json();
	if (!validateWebhook(request, body)) {
		return json$1(
			{
				message: 'Invalid signature',
				signature: request.headers.get('sanity-webook-signature')
			},
			{
				status: 401
			}
		);
	}
	return await generateContent(true);
}

export async function POST({ request }: RequestEvent) {
	const body = await request.json();
	if (!validateWebhook(request, body)) {
		return json$1(
			{
				message: 'Invalid signature',
				signature: request.headers.get('sanity-webook-signature')
			},
			{
				status: 401
			}
		);
	}
	return await generateContent();
}

export async function GET() {
	return await generateContent();
}
