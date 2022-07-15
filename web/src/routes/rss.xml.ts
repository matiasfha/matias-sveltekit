import getPosts from '$api/getPosts';
import { Feed } from 'feed';

export async function GET() {
	const posts = await getPosts();
	const feed = new Feed({
		title: 'Matias Hernández',
		description:
			'Personal site of Matias Hernandez, dev, instructor and podcaster. Helping devs to level up their careers as software Developers',
		id: 'https://matiashernandez.dev/',
		link: 'https://matiashernandez.dev',
		language: 'es',
		feedLinks: {
			atom: 'https://matiashernandez.dev/rss.xml'
		},
		copyright: '',
		author: {
			name: 'Matías Hernández',
			email: 'hola@matiashernandez.dev'
		},
		favicon: 'https://matiashernandez.dev/favicon.ico'
	});
	posts.forEach((post) => {
		feed.addItem({
			id: `https://matiashernandez.dev/blog/post/${post.slug}`,
			title: post.title,
			link: `https://matiashernandez.dev/blog/post/${post.slug}`,
			date: new Date(post.date),
			description: post.description,
			image: post.banner,
			content: post.html
		});
	});
	return {
		headers: {
			'Content-Type': 'application/atom+xml'
		},
		body: feed.atom1()
	};
}
