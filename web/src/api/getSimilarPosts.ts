import type { Post } from '$lib/types';
import getPosts from './getPosts';

export default async function getSimlarPosts(filepath: string): Promise<Post[]> {
	const posts = await getPosts();
	console.log(filepath);
	const post = posts.find((p) => p.filepath.includes(filepath));

	const similarPosts = posts
		.filter((p) => p.slug !== post.slug)
		.filter((p) => {
			const postKeywords = post.keywords;
			const pKeywords = p.keywords;
			const intersection = postKeywords.filter((keyword) => pKeywords.includes(keyword));
			return intersection.length > 0;
		});

	return similarPosts.slice(0, 3);
}
