import slugify from '$lib/utils/slugify';
import type { Posts } from '../../../schema.types';
import { getRawMarkdown } from './generateMarkdown';

export default async function writeToDevTo(post: Posts & { image: string }) {
	const article = {
		title: post.title,
		body_markdown: `
${getRawMarkdown(post.content)}
\n\n
![Footer Social Card.jpg](https://cdn.hashnode.com/res/hashnode/image/upload/v1615457338201/5yOtr5SdF.jpeg)
✉️ [Únete a Micro-bytes](https://microbytes.matiashernandez.dev)         🐦 Sígueme en [Twitter](https://twitter.com/matiasfha)           ❤️ [Apoya mi trabajo](https://buymeacoffee.com/matiasfha) 
`,
		published: true,
		main_image: post.image,
		canonical_url: 'https://matiashernandez.dev/blog/post/' + slugify(post.title),
		description: post.description,
		tags: 'javascript, spanish, webdev'
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
		return {
			status: 500,
			error: e
		};
	}
}
