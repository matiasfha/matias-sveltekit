import getPosts from './getPosts';
import { StringUtils } from 'turbocommons-ts';

export default async function getSimilarPosts(filepath: string, lang = 'en') {
	const posts = await getPosts(lang);
	const post = posts.find((p) => p.filepath.includes(filepath));

	const similarPosts = posts
		.filter((p) => p.slug !== post.slug)
		.map((p) => {
			const postKeywords = post.keywords;
			const pKeywords = p.keywords;
			const similarity = StringUtils.compareSimilarityPercent(
				postKeywords.join(','),
				pKeywords.join('')
			);
			return {
				...p,
				similarity
			};
		})
		.sort((a, b) => b.similarity - a.similarity);

	return similarPosts.slice(0, 3);
}
