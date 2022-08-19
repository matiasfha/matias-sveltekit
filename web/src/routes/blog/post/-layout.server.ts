import fetchSimilarPosts from '$api/getSimilarPosts';
import type { LayoutLoad } from '../../../../.svelte-kit/types/src/routes/blog/post/$types';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ url }) => {
	try {
		const { pathname } = url;
		const similarPosts = await fetchSimilarPosts(pathname);
		console.log({ similarPosts });
		// const mentions = await fetch('/blog/mentions?url=' + encodeURIComponent(pathname));
		// const { likes, retweet } = await mentions.json();

		return {
			similarPosts,
			likes: [],
			retweet: []
		};
	} catch (e) {
		console.error(e);
		throw error(500, 'not found');
	}
};
