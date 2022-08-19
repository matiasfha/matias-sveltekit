import fetchSimilarPosts from '$api/getSimilarPosts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
	let similarPosts = [];
	let likes = [];
	let retweet = [];
	const { pathname } = url;
	try {
		similarPosts = await fetchSimilarPosts(pathname);
	} catch (e) {
		console.error(e);
	}
	try {
		const mentions = await fetch(new URL('/api/mentions'));
		({ likes, retweet } = await mentions.json());
	} catch (e) {
		console.error(e);
	}
	return {
		similarPosts,
		likes,
		retweet
	};
};
