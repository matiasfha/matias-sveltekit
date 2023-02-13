import { createFileInRepo } from '$lib/api/github';
import { error } from '@sveltejs/kit';
import { getLastPostMarkdown, repost } from './utils';

export async function GET() {
	try {
		try {
			const { markdown, title } = await getLastPostMarkdown();

			// await createFileInRepo(markdown, title);
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
