import type { RequestHandler } from './$types';
import getPosts from '$lib/api/getPosts';
import { Feed } from 'feed';

export const GET: RequestHandler = async ({ cookies }) => {
	const posts = await getPosts(cookies.get('lang') ?? 'es');
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
	});
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
