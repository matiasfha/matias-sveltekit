import getArticles from '$api/getAllExternalArticles';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	try {
		const articles = await getArticles();
		console.log({ articles });
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
}
