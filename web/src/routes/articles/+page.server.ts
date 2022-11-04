import type { PageServerLoad } from './$types';
import sanityClient from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const clientOptions = {
	projectId: 'cyypawp1',
	dataset: 'production',
	fetch,
	apiVersion: '2022-06-23', // use current UTC date - see "specifying API version"!
	token: '', // or leave blank for unauthenticated usage
	useCdn: true // `false` if you want to ensure fresh data
};

const client = sanityClient(clientOptions);
const builder = imageUrlBuilder(client);
export const load: PageServerLoad = async () => {
	try {
		const query = `*[_type == "external-articles"]`;
		const res = await client.fetch(query);

		const articles = res.map((item) => {
			return {
				...item,
				image: item.image ? builder.image(item.image).url() : ''
			};
		});
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
