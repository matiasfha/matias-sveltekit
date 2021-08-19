import getArticles from '$api/getAllExternalArticles';

export async function get() {
	try {
		const articles = await getArticles();
		return {
			body: {
				articles,
				featured: articles.find((item) => item.featured)
			}
		};
	} catch (e) {
		console.error(e);
		return {
			status: 500,
			body: e.message
		};
	}
}
