import { request, gql } from 'graphql-request';
import type { ContentElement } from '$lib/types';
interface ExternalArticleSource {
	url: string;
	title: string;
	image: {
		asset: {
			url: string;
		};
	};
	published_at: string;
	tag: string;
	featured?: boolean;
}

const query = gql`
	query articles {
		allExternalArticles {
			url
			title
			image {
				asset {
					url
				}
			}
			published_at
			tag
			featured
		}
	}
`;
export default async function getArticles(): Promise<Array<ContentElement>> {
	const { allExternalArticles } = await request<{
		allExternalArticles: Array<ExternalArticleSource>;
	}>('https://cyypawp1.api.sanity.io/v1/graphql/production/default', query);

	const sorted = allExternalArticles
		.sort((a, b) => {
			const aDate = new Date(a.published_at).getTime();
			const bDate = new Date(b.published_at).getTime();
			return aDate > bDate ? -1 : 1;
		})
		.map((item) => {
			return {
				url: item.url,
				title: item.title,
				image: item.image.asset.url,
				published_at: item.published_at,
				tag: item.tag,
				featured: item.featured
			};
		});
	return sorted;
}

export async function getLatestArticle(): Promise<ContentElement> {
	const articles = await getArticles();
	return articles.at(0);
}
