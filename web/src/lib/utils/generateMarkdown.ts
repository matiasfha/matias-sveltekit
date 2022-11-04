import sanityClient from '@sanity/client';
import BlocksToMarkdown from '@sanity/block-content-to-markdown';
import imageUrlBuilder from '@sanity/image-url';
import type { Posts } from 'src/schema.types';
const clientOptions = {
	projectId: 'cyypawp1',
	dataset: 'production',
	fetch,
	apiVersion: '2022-06-23', // use current UTC date - see "specifying API version"!
	token: '', // or leave blank for unauthenticated usage
	useCdn: true // `false` if you want to ensure fresh data
};

const builder = imageUrlBuilder(sanityClient(clientOptions));

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
		},
		image: (props) => {
			return `![${props.node.alt}](${builder.image(props.node)})`;
		}
	}
};

export function getRawMarkdown(content: Posts['content']) {
	return BlocksToMarkdown(content, {
		projectId: 'cyypawp1',
		dataset: 'production',
		serializers
	}).trim();
}

export function generateMarkdown({
	date,
	banner,
	keywords,
	title,
	description,
	bannerCredit,
	content
}: {
	date: string;
	banner: string;
	keywords: string[];
	title: string;
	description: string;
	bannerCredit: string;
	content: Posts['content'];
}) {
	const keys = keywords
		.map((keyword: string) => `- ${keyword}\n`)
		.join()
		.replace(/,+/g, '')
		.trim();
	return `
---
date: ${date}
banner: ${banner}
keywords: \n${keys}
title: "${title}"
description: "${description}"
bannerCredit: ${bannerCredit}

---
${getRawMarkdown(content)}`;
}
