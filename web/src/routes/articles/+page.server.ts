import getArticles from '$lib/api/getAllExternalArticles';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async () => {
	try {
		const articles = await getArticles();
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
