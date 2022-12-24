import { getRawMarkdown } from '$lib/utils/sanityClient';

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
