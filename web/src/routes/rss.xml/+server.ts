import type { RequestHandler } from './$types';
import getPosts from '$lib/api/getPosts';
import { Feed } from 'feed';
import { sub } from 'date-fns'
import z from 'zod'

const LimitOptions = z.union([z.literal("none"), z.literal("day"), z.literal("week"), z.literal("month")])
function getLimitDate(limit: z.infer<typeof LimitOptions>) {
	const currentDate = new Date()
	switch(limit) {
		case "week":
			return sub(currentDate, { weeks: 1})
		case "day":
			return sub(currentDate, { days: 1})
		case 'month':
			return sub(currentDate, { months: 1})
		default:
			return null;
	}
}


export const GET: RequestHandler = async ({ url }) => {
	const lang = url.searchParams.get('lang') ?? 'es';
	const limit = LimitOptions.parse(url.searchParams.get('limit') ?? 'none'); 
	const limitDate = getLimitDate(limit)

	const posts = await getPosts(lang, limitDate);
	const baseUrl = 'https://matiashernandez.dev';
	const feed = new Feed({
		title: 'Matias Hernández',
		description:
			'Personal site of Matias Hernandez, dev, instructor and podcaster. Helping devs to level up their careers as software Developers',
		id: baseUrl,
		link: baseUrl,
		language: 'es',
		feedLinks: {
			atom: `${baseUrl}/atom.xml`,
			rss2: `${baseUrl}/rss.xml`
		},
		copyright: 'Matías Hernández <hola@matiashernandez.dev>',
		author: {
			name: 'Matías Hernández',
			email: 'hola@matiashernandez.dev'
		},
		favicon: `${baseUrl}/favicon.png`
	})

	posts.forEach((post) => {
		feed.addItem({
			id: `${baseUrl}${post.slug}`,
			title: post.title,
			link: `${baseUrl}${post.slug}`,
			date: new Date(post.date),
			description: post.description,
			image: post.banner,
			content: post.html,
			author: [
				{
					email: 'hola@matiashernandez.dev',
					link: 'https://twitter.com/matiasfha'
				}
			]
		});
	});
	return new Response(feed.rss2(), {
		headers: {
			'Content-Type': 'application/rss+xml;charset=UTF-8',
			'Cache-Control': 'max-age=86400, must-revalidate'
		}
	});
};
