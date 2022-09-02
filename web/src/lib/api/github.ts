import { Octokit } from '@octokit/rest';
import slugify from '../utils/slugify';

export async function createFileInRepo(content: string, title: string) {
	try {
		const octokit = new Octokit({
			auth: import.meta.env.VITE_GITHUB_TOKEN
		});
		const slug = slugify(title);
		const config = {
			owner: 'matiasfha',
			repo: 'matias-sveltekit',
			path: `web/src/routes/blog/post/${slug}/+page.svx`
		};

		// const repo = await octokit.rest.repos.getContent({
		// 	...config
		// });
		// console.log(repo);
		const res = await octokit.rest.repos.createOrUpdateFileContents({
			...config,
			message: 'Create or Update: ' + title,
			content: Buffer.from(content, 'utf8').toString('base64'),
			// sha: repo.data.sha,
			commiter: {
				name: 'Site api',
				email: 'api@matiashernandez.dev'
			}
		});
		return res;
		// return repo;
	} catch (e) {
		console.error('github', e);
	}
}

export async function updateFileInRepo(content: string, title: string) {
	try {
		const octokit = new Octokit({
			auth: import.meta.env.VITE_GITHUB_TOKEN
		});
		const slug = slugify(title);
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
