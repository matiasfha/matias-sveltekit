import { request, gql } from 'graphql-request';

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
export default async function getCourses(): Promise<Array<any>> {
	const { allMicrobytes } = await request<{
		allMicrobytes: Array<Source>;
	}>('https://cyypawp1.api.sanity.io/v1/graphql/production/default', query);
	return allMicrobytes;
}

export async function get() {
	const courses = await getCourses();
	return {
		body: courses
	};
}
