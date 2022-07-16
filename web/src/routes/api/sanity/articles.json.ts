import sanityClient from '@sanity/client';
import { isValidSignature } from '@sanity/webhook';
import type { RequestEvent } from '@sveltejs/kit';
import type { Posts } from '../../../schema.types';

import BlocksToMarkdown from '@sanity/block-content-to-markdown';
import imageUrlBuilder from '@sanity/image-url';

import { createFileInRepo, updateFileInRepo } from '$lib/utils/github';
import { getDeployStatus } from '$lib/netlify';
import writeToDevTo from './writeToDevTo';
import writeToHashnode from './writeToHashnode';

const clientOptions = {
	projectId: 'cyypawp1',
	dataset: 'production',
	fetch,
	apiVersion: '2022-06-23', // use current UTC date - see "specifying API version"!
	token: '', // or leave blank for unauthenticated usage
	useCdn: true // `false` if you want to ensure fresh data
};

const builder = imageUrlBuilder(sanityClient(clientOptions));

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

const serializers = {
	types: {
		code: (props) => '```' + props.node.language + '\n' + props.node.code + '\n```',
		table: (props) => {
			const { rows } = props.node;
			const headers = rows[0].cells;
			const headersMarkdown = headers.map((header) => `${header}`).join(' | ');
			const separator = '|' + headers.map((_) => '---').join(' | ') + '|';
			const rowsContent = rows.slice(1, rows.length).map((row) => row.cells);
			const rowsMarkdown = rowsContent.map((row) => `| ${row.join(' | ')} |`).join('\n');
			return `| ${headersMarkdown} |\n${separator}\n${rowsMarkdown}`;
		}
	}
};

function generateMarkdown({
	date,
	banner,
	keywords,
	title,
	description,
	bannerCredit,
	content
}: {
	date: string;
	banner: string;
	keywords: string[];
	title: string;
	description: string;
	bannerCredit: string;
	content: Posts['content'];
}) {
	const keys = keywords
		.map((keyword: string) => `- ${keyword}\n`)
		.join()
		.replace(/,+/g, '')
		.trim();
	return `
---
date: ${date}
banner: ${banner}
keywords: \n${keys}
title: ${title}
description: ${description}
bannerCredit: ${bannerCredit}
tag: Posts
---

${BlocksToMarkdown(content, { projectId: 'cyypawp1', dataset: 'production', serializers })}
                   
    `.trim();
}

export async function PUT({ request }: RequestEvent) {
	const body = await request.json();
	if (!validateWebhook(request, body)) {
		return {
			status: 401,
			body: {
				message: 'Invalid signature',
				signature: request.headers.get('sanity-webook-signature')
			}
		};
	}
	try {
		const post: Posts = body;

		const markdown = generateMarkdown({
			date: post._createdAt,
			banner: builder.image(post.banner.asset._ref).url(),
			keywords: body.keywords,
			title: post.title,
			description: post.description,
			bannerCredit: post.banner.bannerCredit,
			content: post.content
		});
		console.log(markdown);
		const res = await updateFileInRepo(markdown, post.title);
		console.log('File created in github');
		const netlify = await getDeployStatus();
		if (netlify) {
			console.log('Deployed, ready to re-post');
		}
		// @TODO
		// How to update the article on Dev.to and Hashnode?
		return {
			body: {
				res,
				title: post.title
			}
		};
	} catch (e) {
		console.error(e);
		return {
			status: 500,
			body: e.message
		};
	}
}
export async function POST({ request }: RequestEvent) {
	const body = await request.json();
	if (!validateWebhook(request, body)) {
		return {
			status: 401,
			body: {
				message: 'Invalid signature',
				signature: request.headers.get('sanity-webook-signature')
			}
		};
	}
	try {
		const post: Posts = body;
		const markdown = generateMarkdown({
			date: post._createdAt,
			banner: builder.image(post.banner.asset._ref).url(),
			keywords: body.keywords,
			title: post.title,
			description: post.description,
			bannerCredit: post.banner.bannerCredit,
			content: post.content
		});

		const res = await createFileInRepo(markdown, post.title);
		console.log('File created in github');
		const dev = await writeToDevTo({ ...post, image: builder.image(post.banner.asset._ref).url() });
		console.log('File created in DevTo');
		const hashnode = await writeToHashnode({
			...post,
			image: builder.image(post.banner.asset._ref).url()
		});
		console.log('File created in Hashnode');

		return {
			body: {
				res,
				title: post.title,
				dev,
				hashnode
			}
		};
	} catch (e) {
		console.error(e);
		return {
			status: 500,
			body: e.message
		};
	}
}

// async function shareToTwitter() {
//     const requestTokenURL = 'https://api.twitter.com/oauth/request_token?oauth_callback=oob&x_auth_access_type=write';
//     const authorizeURL = new URL('https://api.twitter.com/oauth/authorize');
//     const accessTokenURL = 'https://api.twitter.com/oauth/access_token';
//     const oauth = OAuth({
//     consumer: {
//         key: consumer_key,
//         secret: consumer_secret
//     },
//     signature_method: 'HMAC-SHA1',
//     hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
//     });
// }
import { createClient } from 'sanity-codegen';
import type { Documents } from '../../../schema.types';
const client = createClient<Documents>(clientOptions);

export async function GET({ request }: RequestEvent) {
	// const res = await getDeployStatus();
	try {
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

		const res = await createFileInRepo(markdown, post.title);
		const dev = await writeToDevTo({ ...post, image: builder.image(post.banner.asset._ref).url() });

		const hashnode = await writeToHashnode({
			...post,
			image: builder.image(post.banner.asset._ref).url()
		});

		return {
			body: {
				res,
				//hashnode,
				//dev,
				markdown
			}
		};
	} catch (e) {
		console.error(e);
		return {
			status: 500,
			body: e.message
		};
	}
}
