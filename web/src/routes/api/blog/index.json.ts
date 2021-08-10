import getPosts from '$lib/getPosts';

export async function get() {
	const posts = await getPosts();
	return {
		body: posts
	};
}
