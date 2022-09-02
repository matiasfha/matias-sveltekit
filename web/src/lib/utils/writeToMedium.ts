import slugify from '$lib/utils/slugify';
import type { Posts } from '../../schema.types';
import { getRawMarkdown } from './generateMarkdown';
const USER_ID = '141f5601d7971ac8cfaaa88d4c909a1134f148586299e7b6b591e09679b63085c';
const TOKEN = import.meta.env.VITE_MEDIUM_TOKEN;
export async function writeToMedium(post: Posts) {
	try {
		const data = {
			title: post.title,
			contentFormat: 'markdown',
			content: getRawMarkdown(post.content),
			canonicalUrl: 'https://matiashernandez.dev/blog/post/' + slugify(post.title),
			tags: ['javascript', 'web development', 'javascript tips', 'spanish'],
			publishStatus: 'public'
		};

		const res = await fetch(`https://api.medium.com/v1/users/${USER_ID}/posts`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${TOKEN}`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
				'Accept-Charset': 'utf-8'
			},
			body: JSON.stringify(data)
		});
		if (res.ok) {
			const json = await res.json();
			return {
				status: res.status,
				slug: json
			};
		}
		return {
			status: res.status,
			error: res.statusText
		};
	} catch (e) {
		console.error(e);
		return {
			status: 500,
			error: e
		};
	}
}
