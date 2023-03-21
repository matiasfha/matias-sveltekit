import type { Post } from 'src/routes/api/articles/utils';
import type { z } from 'zod';
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
