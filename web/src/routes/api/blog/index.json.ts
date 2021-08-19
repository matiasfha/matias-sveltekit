import getPosts from '$api/getPosts';

export async function get() {
	const posts = await getPosts();
	return {
		body: {
			posts,
			featured: posts.find((item) => item.featured)
		}
	};
}
