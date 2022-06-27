import slugify from '$lib/utils/slugify';
import BlocksToMarkdown from '@sanity/block-content-to-markdown';
import type { Documents, Posts } from '../../../schema.types';

export default async function writeToDevTo(post: Posts) {
	const article = {
		title: post.title,
		body_markdown: BlocksToMarkdown(post.content, { projectId: 'cyypawp1', dataset: 'production' }),
		published: true,
		main_image: post.banner.asset._ref,
		canonical_url: 'https://matiashernandez.dev/blog/' + slugify(post.title),
		description: post.description,
		tags: post.keywords
	};
	try {
		const res = await fetch('https://dev.to/api/articles', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'api-key': import.meta.env.VITE_DEVTO_TOKEN
			},
			body: JSON.stringify({ article })
		});
		return {
			status: res.status,
			url: res.url
		};
	} catch (e) {
		console.error(e);
	}
}
