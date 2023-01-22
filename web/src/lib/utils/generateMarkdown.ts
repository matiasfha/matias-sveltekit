import z from 'zod';
export const Post = z.lazy(() =>
	z.object({
		date: z.string(),
		banner: z.string(),
		keywords: z.array(z.string()),
		title: z.string(),
		description: z.string(),
		content: z.string(),
		lang: z.union([z.literal('es'), z.literal('en')]) 
	})
);
export function generateMarkdown({
	date,
	banner,
	keywords,
	title,
	description,
	content,
	lang
}: z.infer<typeof Post>): string {
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
${content}`;
}
