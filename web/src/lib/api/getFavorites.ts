import { request, gql } from 'graphql-request';
import type { ContentElement } from '$lib/types';

type FavoriteSource = Omit<ContentElement, 'image'> & {
	image: {
		asset: {
			url: string;
		};
	};
};

const query = gql`
	query favorites {
		allFavorites {
			url
			title
			image {
				asset {
					url
				}
			}
			tag
		}
	}
`;
export default async function getFavorites(): Promise<Array<ContentElement>> {
	const { allFavorites } = await request<{
		allFavorites: Array<FavoriteSource>;
	}>('https://cyypawp1.api.sanity.io/v1/graphql/production/default', query);
	const sorted = allFavorites.map((item) => {
		return {
			url: item.url,
			title: item.title,
			image: item.image.asset.url,
			tag: item.tag
		};
	});
	return sorted;
}
