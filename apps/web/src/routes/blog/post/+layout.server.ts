import fetchSimilarPosts from '$lib/api/getSimilarPosts';
import { getWebMetions } from '$lib/api/getWebMentions';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, cookies }) => {
	const lang = cookies.get('lang') || 'en';
	let similarPosts = [];
	let likes = [];
	let retweet = [];
	const { pathname } = url;
	try {
		similarPosts = await fetchSimilarPosts(pathname, lang);
	} catch (e) {
		console.error(e);
	}
	try {
		const mentions = await getWebMetions(pathname);
		likes = mentions.likes;
		retweet = mentions.retweet;
	} catch (e) {
		console.error(e);
	}

	return {
		similarPosts,
		likes,
		retweet
	};
};
