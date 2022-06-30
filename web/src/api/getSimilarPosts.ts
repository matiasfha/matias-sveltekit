import type { Post } from '$lib/types';
import getPosts from './getPosts';

export default async function getSimlarPosts(filepath: string): Promise<Post[]> {
	const module = () => import('../routes' + filepath + '.svx');

	const data = await module();
	const post: Post = data.metadata;
	const slug = post.filepath.match(/([\w-]+)\.(svelte\.md|md|svx)/i)?.[1] ?? null;
	const posts = await getPosts();

	const similarPosts = posts
		.filter((p) => p.slug !== slug)
		.filter((p) => {
			const postKeywords = post.keywords;
			const pKeywords = p.keywords;
			const intersection = postKeywords.filter((keyword) => pKeywords.includes(keyword));
			return intersection.length > 0;
		});

	return similarPosts.slice(0, 3);
}
