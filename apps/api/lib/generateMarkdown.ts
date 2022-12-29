
import BlocksToMarkdown from '@sanity/block-content-to-markdown';
import { builder } from './sanityClient';

export const sanityProjectId = 'cyypawp1';//@TODO this should be in env?

const serializers = {
	types: {
		code: (props) => '```' + props.node.language + '\n' + props.node.code + '\n```',
		table: (props) => {
			const { rows } = props.node;
			const headers = rows[0].cells;

			const headersMarkdown = headers.map((header) => `${header}`).join(' | ');

			const separator = '|' + headers.map(() => '---').join(' | ') + '|';

			const rowsContent = rows.slice(1, rows.length).map((row) => row.cells);

			const rowsMarkdown = rowsContent.map((row) => `| ${row.join(' | ')} |`).join('\n');
			return `| ${headersMarkdown} |\n${separator}\n${rowsMarkdown}`;
		},
		image: (props) => {
			return `![${props.node.alt}](${builder.image(props.node)})`;
		}
	}
};

function getRawMarkdown(content: unknown) {
	return BlocksToMarkdown(content, {
		projectId: sanityProjectId,
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
	content,
	lang
}: {
	date: string;
	banner: string;
	keywords: string[];
	title: string;
	description: string;
	content: unknown;
	lang: string;
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
lang: ${lang}
---
${getRawMarkdown(content)}`;
}

