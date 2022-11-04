import type { PageServerLoad } from './$types';
import getPosts from '$lib/api/getPosts';

export const load: PageServerLoad = async () => {
	const posts = await getPosts();

	const tags = new Set<string>();
	posts.forEach((post) => {
		if (post.tag) {
			tags.add(post.tag);
		}
	});
	return {
		posts,
		featured: posts.find((item) => item.featured),
		tags: [...tags]
	};
};
