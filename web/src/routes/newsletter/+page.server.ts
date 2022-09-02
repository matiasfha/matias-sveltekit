import { request, gql } from 'graphql-request';
import type { PageServerLoad } from './$types';

type Source = {
	course: string;
	image: {
		asset: {
			altText: string;
			url: string;
		};
	};
	tagId: string;
	descriptionRaw: string;
};

const query = gql`
	query {
		allMicrobytes {
			course
			image {
				asset {
					altText
					url
				}
			}
			tagId
			descriptionRaw
		}
	}
`;

export const load: PageServerLoad = async () => {
	const { allMicrobytes } = await request<{
		allMicrobytes: Array<Source>;
	}>('https://cyypawp1.api.sanity.io/v1/graphql/production/default', query);
	return {
		courses: allMicrobytes
	};
};
