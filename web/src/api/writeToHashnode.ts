import slugify from '$lib/utils/slugify';
import type { Posts } from '../schema.types';
import { getRawMarkdown } from './generateMarkdown';

export default async function writeToHashnode(post: Posts & { image: string }) {
	const article = {
		title: post.title,
		contentMarkdown: `${getRawMarkdown(post.content)}
        	%%[buymeacoffee]
        `,
		coverImageURL: post.image,
		isRepublished: {
			originalArticleURL: 'https://matiashernandez.dev/blog/post/' + slugify(post.title)
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
		operationName: 'createPublicationStory',
		query: `mutation createPublicationStory(
                $title: String!,
                $contentMarkdown: String!,
                $coverImageURL: String!,
                $isRepublished: isRepublished, 
                $tags: [TagsInput]!
            ) {
            createPublicationStory(
                publicationId: "5f75e21237eb052c1b80d7ec",
                input:{
                    title: $title
                    contentMarkdown: $contentMarkdown
                    coverImageURL: $coverImageURL
                    isRepublished: $isRepublished
                    tags: $tags
                }) {
              post {
                slug
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
			slug: json
		};
	} catch (e) {
		console.error(e);
	}
}
