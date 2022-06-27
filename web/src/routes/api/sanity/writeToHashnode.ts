import slugify from '$lib/utils/slugify';
import BlocksToMarkdown from '@sanity/block-content-to-markdown';
import type { Posts } from '../../../schema.types';

export default async function writeToHashnode(post: Posts) {
	const article = {
		title: post.title,
		contentMarkdown: BlocksToMarkdown(post.content, {
			projectId: 'cyypawp1',
			dataset: 'production'
		}),
		coverImageURL: post.banner.asset._ref,
		isRepublished: {
			originalArticleURL: 'https://matiashernandez.dev/blog/' + slugify(post.title)
		},
		tags: [
			{
				_id: '56744721958ef13879b94cad'
			},
			{
				_id: '56a399f292921b8f79d3633c'
			}
		]
	};
	const query = {
		operationName: 'createArticle',
		query: `mutation createStory($title: String!, $contentMarkdown: String!, $coverImageURL: String!, $isRepublished: isRepublished, $tags: [TagsInput!]) {
            createStory(input:{
              title: $title
              contentMarkdown: $contentMarkdown
              coverImageURL: $coverImageURL
              isRepublished: $isRepublished
              tags: $tags
            }) {
              post {
                author
                title
              }
            }
          }`,
		variables: article
	};
	try {
		const res = await fetch('https://api.hashnode.com/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: import.meta.env.VITE_HASHNODE_TOKEN
			},
			body: JSON.stringify(query)
		});
		const json = await res.json();
		return {
			status: res.status,
			slug: json.data.createStory.post.slug
		};
	} catch (e) {
		console.error(e);
	}
}
