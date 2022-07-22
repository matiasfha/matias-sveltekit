import slugify from '$lib/utils/slugify';
import type { Posts } from '../../../schema.types';
import { getRawMarkdown } from './generateMarkdown';

const serializers = {
	types: {
		code: (props) => '```' + props.node.language + '\n' + props.node.code + '\n```',
		table: (props) => {
			const { rows } = props.node;
			const headers = rows[0].cells;
			const headersMarkdown = headers.map((header) => `${header}`).join(' | ');
			const separator = '|' + headers.map((_) => '---').join(' | ') + '|';
			const rowsContent = rows.slice(1, rows.length).map((row) => row.cells);
			const rowsMarkdown = rowsContent.map((row) => `| ${row.join(' | ')} |`).join('\n');
			return `| ${headersMarkdown} |\n${separator}\n${rowsMarkdown}`;
		}
	}
};

export default async function writeToDevTo(post: Posts & { image: string }) {
	const article = {
		title: post.title,
		body_markdown: `
${getRawMarkdown(post.content)}

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
		console.log(await res.json());
		return {
			status: res.status,
			url: res.url
		};
	} catch (e) {
		console.error(e);
	}
}
