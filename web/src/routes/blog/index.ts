import getPosts from '$api/getPosts';

export async function GET() {
	const posts = await getPosts();

	return {
		status: 200,
		body: {
			posts,
			featured: posts.find((item) => item.featured)
		}
	};
}
