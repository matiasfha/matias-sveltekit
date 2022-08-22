import { Octokit } from '@octokit/rest';
import { error } from '@sveltejs/kit';

import type { RequestEvent, RequestHandler } from './$types';

async function validateCaptcha(captchaResponse: string) {
	const secret = process.env['HCAPTCHA_SECRETKEY'];
	const sitekey = process.env['VITE_HCAPTCHA_SITEKEY'];
	const body = new URLSearchParams({
		response: captchaResponse,
		secret,
		sitekey
	});
	try {
		const response = await fetch('https://hcaptcha.com/siteverify', {
			method: 'POST',
			credentials: 'omit',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: body.toString()
		});
		const data = await response.json();
		const { success } = data;
		return success;
	} catch (e) {
		console.error(e);
		return false;
	}
}

export const POST: RequestHandler = async ({ request }: RequestEvent) => {
	const octokit = new Octokit({
		auth: import.meta.env.VITE_GITHUB_TOKEN
	});
	try {
		const values = await request.formData();
		const isCaptchaValid = validateCaptcha(values.get('hcaptcha') as string);

		if (isCaptchaValid) {
			const body = `
\n
	Name: ${values.get('name')}
\n
${values.get('body')}
\n`;
			const res = await octokit.request('POST /repos/{owner}/{repo}/issues', {
				owner: 'matiasfha',
				repo: 'ama',
				title: values.get('title') as string,
				body
			});

			return new Response(
				JSON.stringify({
					message: 'success',
					url: res.data.html_url
				}),
				{ status: res.status }
			);
		}
		return new Response(
			JSON.stringify({
				message: 'captcha failed'
			}),
			{ status: 401 }
		);
	} catch (e) {
		console.error(e);
		// return new Response(error(e), { status: e.status });
		return error(e);
	}
};
