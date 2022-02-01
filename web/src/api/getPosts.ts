import type { Post } from '$lib/types';

export default async function getPosts(): Promise<Post[]> {
	const modules = import.meta.glob(`../routes/blog/post/*.svx`);

	const postPromises = [];
	for (const [path, resolver] of Object.entries(modules)) {
		const promise = resolver().then((post) => {
			const slug = path.match(/([\w-]+)\.(svelte\.md|md|svx)/i)?.[1] ?? null;
			return {
				slug,
				...post.metadata
			};
		});
		postPromises.push(promise);
	}

	const posts = await Promise.all(postPromises);

	return posts.sort((a, b) => {
		const aDate = new Date(a.date).getTime();
		const bDate = new Date(b.date).getTime();
		return aDate < bDate ? 1 : -1;
	});
}

export async function getLatestPost() {
	const posts = await getPosts();

	return posts[0];
}
