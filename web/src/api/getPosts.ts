import type { Post } from '$lib/types';

export default async function getPosts(): Promise<Post[]> {
	const modules = import.meta.glob('../routes/blog/post/**/+page.svx');

	const postPromises = [];
	for (const [path, resolver] of Object.entries(modules)) {
		const promise = resolver().then((post) => {
			const slug = path.slice(0, -4).slice(9).split('/+').shift();
			return {
				slug: slug
					.normalize('NFD')
					.replace(/[\u0300-\u036f]/g, '')
					.replace(/\?|\¿/g, ''),
				...post.metadata,
				html: post.default.render?.().html,
				path: path.slice(0, -4).slice(9)
			};
		});
		postPromises.push(promise);
	}

	const res = await Promise.all(postPromises);

	const posts: Post[] = res.sort((a, b) => {
		const aDate = new Date(a.date).getTime();
		const bDate = new Date(b.date).getTime();
		return aDate < bDate ? 1 : -1;
	});
	return posts;
}

export async function getLatestPost() {
	const posts = await getPosts();

	return posts[0];
}
