import fetchSimilarPosts from '$lib/api/getSimilarPosts';
import { getWebMetions } from '$lib/api/getWebMentions';
import type { ServerlessConfig } from '@sveltejs/adapter-vercel';
import type { LayoutServerLoad } from './$types';
export const config: ServerlessConfig  = {
	runtime: 'nodejs18.x',
	isr: {
		expiration: 60
	}
};

export const load: LayoutServerLoad = async ({ url, cookies }) => {
	const lang = cookies.get('lang') || 'en';
	let similarPosts = [];
	let likes = [];
	let retweet = [];
	const { pathname } = url;
	const similarPostsP = fetchSimilarPosts(pathname, lang);
	const mentionsP = getWebMetions(pathname);

	try {
		const [posts, mentions] = await Promise.all([similarPostsP, mentionsP]);
		similarPosts = posts;
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
