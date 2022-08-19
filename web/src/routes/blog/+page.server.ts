import getPosts from '$api/getPosts';

export async function load() {
	const posts = await getPosts();

	return {
		posts,
		featured: posts.find((item) => item.featured)
	};
}
