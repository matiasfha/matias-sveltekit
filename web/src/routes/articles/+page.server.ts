import type { PageServerLoad } from './$types';
import getArticles from '$lib/api/getAllExternalArticles';
export const load: PageServerLoad = async ({ cookies }) => {
	const lang = cookies.get('lang');
	try {
		const articles = await getArticles(lang);
		return {
			articles,
			featured: articles.find((item) => item.featured)
		};
	} catch (e) {
		return {
			articles: [],
			featured: null
		};
	}
};

export const config = {
	runtime: 'edge',
	isr: {
		expiration: 60,

	}
}
