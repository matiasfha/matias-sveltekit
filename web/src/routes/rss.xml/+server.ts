import type { RequestHandler } from './$types';
import getPosts from '$lib/api/getPosts';
import { Feed } from 'feed';

export const GET: RequestHandler = async () => {
	const posts = await getPosts();
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
		copyright: '',
		author: {
			name: 'Matías Hernández',
			email: 'hola@matiashernandez.dev'
		},
		favicon: `${baseUrl}/favicon.png`
	});
	posts.forEach((post) => {
		feed.addItem({
			id: `${baseUrl}/blog/post/${post.slug}`,
			title: post.title,
			link: `${baseUrl}/blog/post/${post.slug}`,
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
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
