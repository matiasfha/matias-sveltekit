import type { PageServerLoad } from './$types';
import getPosts from '$lib/api/getPosts';

export const load: PageServerLoad = async ({ params }) => {
	const posts = await getPosts();

	const { tag } = params;

	return {
		posts: posts.filter((item) => item.tag?.toLowerCase() === tag)
	};
};
