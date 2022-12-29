import type { RequestEvent } from './$types';
import { error } from '@sveltejs/kit';
import { getLastPost } from '../../../lib/getLastPost';
import { createFileInRepo } from '../../../lib/github'


export const POST = async ({ request }: RequestEvent) => {
	// if (!validateWebhook(request)) {
	// 	return new Response(
	// 		JSON.stringify({
	// 			message: 'Invalid signature',
	// 			signature: request.headers.get('sanity-webook-signature')
	// 		}),
	// 		{
	// 			status: 401
	// 		}
	// 	);
	// }
	try {
		const { markdown, title } = await getLastPost();
		// await createFileInRepo(markdown, title);
		// await repost();
		return new Response('Post and repost created', {
			status: 200
		});
	} catch (e) {
		console.error(e);
		throw error(e);
	}
};


export const GET = async ({ request }: RequestEvent) => {
	try {
		const { markdown, title } = await getLastPost();
		// await createFileInRepo(markdown, title);
		// await repost();
		return new Response(markdown, {
			status: 200
		});
	} catch (e) {
		console.error(e);
		throw error(e);
	}
};
