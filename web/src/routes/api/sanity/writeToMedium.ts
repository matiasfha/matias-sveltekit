import slugify from '$lib/utils/slugify';
import type { Posts } from 'src/schema.types';
import { getRawMarkdown } from './generateMarkdown';

export async function writeToMedium(post: Posts) {
	try {
		const res = await fetch('https://api.medium.com/v1/users/781cea6a33de/posts', {
			method: 'POST',
			headers: {
				Authorization: 'Bearer 29b9a4b510f94346e95cc4985059e1b3d1749b8c66d63cf0abf1efcf58eac8139'
			},
			body: JSON.stringify({
				title: post.title,
				contentFormat: 'markdown',
				content: getRawMarkdown(post.content),
				canonicalUrl: 'https://matiashernandez.dev/blog/post/' + slugify(post.title),
				tags: ['javascript', 'web development', 'javascript tips', 'spanish'],
				publishStatus: 'public'
			})
		});
		const json = await res.json();
		return {
			status: res.status,
			slug: json
		};
	} catch (e) {
		console.error(e);
		return {
			status: 500,
			error: e
		};
	}
}
