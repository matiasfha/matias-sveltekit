import z from 'zod'
import { builder, client } from './sanityClient';
import { generateMarkdown } from './generateMarkdown'

const Post = z
	.object({
		_createdAt: z.string(),
		banner: z.object({
			asset: z
				.object({
					_ref: z.string()
				})
				.nullable()
		}),
		keywords: z.array(z.string()),
		title: z.string(),
		description: z.string(),
		content: z.array(z.record(z.any())),
		language: z.array(z.union([z.literal('es'), z.literal('en')]))
	})
	.transform((val) => ({
		...val,
		banner: val.banner.asset ? builder.image(val.banner.asset._ref).url(): '',
		lang: val.language[0]
	}));

export async function getLastPost(): Promise<{ markdown: string } & z.infer<typeof Post>> {
	const post = await client
		.fetch('*[_type == "posts"] | order(_createdAt desc)[0]')
		.then((p) => Post.parse(p));

  const markdown = generateMarkdown({
		date: post._createdAt,
		banner: post.banner,
		keywords: post.keywords,
		title: post.title,
		description: post.description,
		content: post.content,
		lang: post.lang
	});
	return {
		markdown,
		...post
	};
}

