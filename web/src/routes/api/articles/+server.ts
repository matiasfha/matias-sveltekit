import { createFileInRepo } from '$lib/api/github';
import type { RequestEvent, RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getLastPostMarkdown, repost, validateWebhook } from './utils';

export const POST = async ({ request }: RequestEvent) => {
	const body = await request.json();
	if (!validateWebhook(request, body)) {
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
		const deploy = await listenNetlify();
		if (deploy.isReady) {
			await repost();
			return new Response('Post and repost created', {
				status: 200
			});
		}
		return new Response('Deploy failed or did not finished', {
			status: 500
		});
	} catch (e) {
		console.error(e);
		throw error(e);
	}
};

function waitFor(callback) {
	return new Promise((resolve, reject) => {
		const tick = setInterval(async () => {
			const response = await callback();

			if (response === 'ready') {
				clearInterval(tick);
				return resolve(response);
			}
			if (response === 'error') {
				clearInterval(tick);
				return reject(response);
			}
		}, 2000);
	});
}

async function checkDeployState(deployId) {
	const siteID = 'fc23c69d-0768-4412-be6f-a50ec4e4531c';
	const token = import.meta.env.VITE_NETLIFY_TOKEN;
	const baseUrl = `https://api.netlify.com/api/v1/sites/${siteID}`;
	try {
		const deploy = await fetch(`${baseUrl}/deploys/${deployId}`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		const res = await deploy.json();
		console.log('Current deploy state: ', res.state);
		return res.state;
	} catch (e) {
		throw error(e);
	}
}

async function listenNetlify() {
	const siteID = 'fc23c69d-0768-4412-be6f-a50ec4e4531c';
	const token = import.meta.env.VITE_NETLIFY_TOKEN;
	const baseUrl = `https://api.netlify.com/api/v1/sites/${siteID}`;

	try {
		const deployList = await fetch(`${baseUrl}/deploys?page=1&per_page=1`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		const res = await deployList.json();
		console.log('List ready');
		if (res[0].state !== 'ready') {
			const isReady = await waitFor(() => checkDeployState(res[0].id));
			return {
				isReady,
				deploy: res[0]
			};
		}
		return {
			isReady: true,
			deploy: res[0]
		};
	} catch (e) {
		throw error(e);
	}
}

// export async function GET() {
// 	try {
// 		const list = await listenNetlify();
// 		if (list.isReady) {
// 			await repost();
// 			return new Response('Repost successfull', {
// 				status: 200
// 			});
// 		}
// 	} catch (e) {
// 		throw error(e);
// 	}
// }
