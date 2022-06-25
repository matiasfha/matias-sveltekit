import sanityClient from '@sanity/client';
import { isValidRequest, isValidSignature, requireSignedRequest } from '@sanity/webhook';
import type { RequestEvent } from '@sveltejs/kit';
import { createClient } from 'sanity-codegen';
import type { Documents, Posts } from '../../../schema.types';

import BlocksToMarkdown from '@sanity/block-content-to-markdown';
import imageUrlBuilder from '@sanity/image-url';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
	auth: import.meta.env.VITE_GITHUB_TOKEN
});

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
		.replace(',', '');
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

${BlocksToMarkdown(content, { projectId: 'cyypawp1', dataset: 'production' })}
                   
    `;
}
async function createFileInRepo(content: string, title: string) {
	try {
		const slug = title
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/\?|\¿/g, '')
			.replace(/\s+/g, '-')
			.trim()
			.toLowerCase();
		const config = {
			owner: 'matiasfha',
			repo: 'matias-sveltekit',
			path: `web/src/routes/blog/post/${slug}.svx`
		};

		const repo = await octokit.rest.repos.getContent({
			...config
		});

		const res = await octokit.rest.repos.createOrUpdateFileContents({
			...config,
			message: 'Create or Update: ' + title,
			content: Buffer.from(content, 'utf8').toString('base64'),
			sha: repo.data.sha,
			commiter: {
				name: 'Site api',
				email: 'api@matiashernandez.dev'
			}
		});
		return res;
	} catch (e) {
		console.error(e);
	}
}

export async function post({ request }: RequestEvent) {
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
		return {
			body: {
				res,
				title: post.title,
				headers: request.headers
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

// export async function get({ request }: RequestEvent) {
// 	try {
// 		const [post] = await client.query<Posts>('*[_type == "posts"]');

// 		const markdown = generateMarkdown({
// 			date: post._createdAt,
// 			banner: builder.image(post.banner.asset._ref).url(),
// 			keywords: post.keywords,
// 			title: post.title,
// 			description: post.description,
// 			bannerCredit: post.banner.bannerCredit,
// 			content: post.content
// 		});
// 		const res = await createFileInRepo(markdown, post.title);
// 		return {
// 			body: {
// 				res,
// 				title: post.title
// 			}
// 		};
// 	} catch (e) {
// 		console.error(e);
// 		return {
// 			status: 500,
// 			body: e.message
// 		};
// 	}
// }
