import type { Post } from '$lib/types';

export default async function getPosts(): Promise<Post[]> {
	const modules = import.meta.glob('../routes/blog/post/*.svx');

	const postPromises = [];
	for (const [path, resolver] of Object.entries(modules)) {
		const promise = resolver().then((post) => {
			const slug = path.match(/([\w-]+)\.(svelte\.md|md|svx)/i)?.[1] ?? null;

			return {
				slug: slug
					.normalize('NFD')
					.replace(/[\u0300-\u036f]/g, '')
					.replace(/\?|\¿/g, ''),
				...post.metadata,
				html: post.default.render().html,
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
	// return posts.map((post: Post) => {
	// 	// find similar post by keywords for the current post
	// 	const similarPosts = posts.filter((p) => {
	// 		const postKeywords = post.keywords;
	// 		const pKeywords = p.keywords;
	// 		const intersection = postKeywords.filter((keyword) => pKeywords.includes(keyword));
	// 		return intersection.length > 0;
	// 	});
	// 	return {
	// 		...post,
	// 		similarPosts
	// 	};
	// });
}

export async function getLatestPost() {
	const posts = await getPosts();

	return posts[0];
}
