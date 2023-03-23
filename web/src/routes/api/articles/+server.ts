import { createFileInRepo } from '$lib/api/github';
import { error, json } from '@sveltejs/kit';
import { getLastPostMarkdown, repost } from './utils';
import { dev } from '$app/environment';
import { generateMarkdown } from '$lib/utils/generateMarkdown';
import {
	SANITY_AUTHORIZED_HEADER,
	SANITY_AUTHORIZED_HEADER_VALUE,
} from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	console.log('Webhook incoming')
	if (request.headers.get(SANITY_AUTHORIZED_HEADER) !== SANITY_AUTHORIZED_HEADER_VALUE) {
		throw error(401, { message: 'What are you doing here?' });
	}
	try {
		const { markdown, ...post } = await getLastPostMarkdown();
		const fileContent = generateMarkdown(post);
		await Promise.allSettled([createFileInRepo(fileContent, post.title), repost(post)]);
		return new Response(markdown, {
			status: 200
		});
	} catch (e) {
		console.error(e);
		throw error(500, 'Deploy failed or did not finished');
	}
	//}
};
