import { createFileInRepo } from '$lib/api/github';
import type { RequestEvent } from './$types';
import { error } from '@sveltejs/kit';
import { getLastPostMarkdown, repost, validateWebhook } from './utils';

export const POST = async ({ request }: RequestEvent) => {
	if (!validateWebhook(request)) {
		return new Response(
			JSON.stringify({
				message: 'Invalid signature',
				signature: request.headers.get('sanity-webook-signature')
			}),
			{
				status: 401
			}
		);
	}
	try {
		const { markdown, title } = await getLastPostMarkdown();
		await createFileInRepo(markdown, title);
		await repost();
		return new Response('Post and repost created', {
			status: 200
		});
	} catch (e) {
		console.error(e);
		throw error(e);
	}
};

export async function GET() {
	try {
		try {
			const { markdown, title } = await getLastPostMarkdown();

			await createFileInRepo(markdown, title);
			await repost();
			return new Response(markdown, {
				status: 200
			});
		} catch (e) {
			console.error(e);
			return new Response(
				JSON.stringify({ message: 'Deploy failed or did not finished', error: e }),
				{
					status: 500
				}
			);
		}
		//}
	} catch (e) {
		console.error(e);
		throw error(e);
	}
}
