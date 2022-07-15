import getArticles from '$api/getAllExternalArticles';

export async function GET() {
	try {
		const articles = await getArticles();
		return {
			status: 200,
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
