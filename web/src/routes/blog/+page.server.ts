import type { PageServerLoad } from './$types';
import getPosts from '$lib/api/getPosts';

export const load: PageServerLoad = async () => {
	const posts = await getPosts();

	return {
		posts,
		featured: posts.find((item) => item.featured)
	};
};
