
import sanityClient from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityProjectId = 'cyypawp1';
const clientOptions = {
	projectId: sanityProjectId,
	dataset: 'production',
	fetch,
	apiVersion: '2022-06-23', // use current UTC date - see "specifying API version"!
	token: '', // or leave blank for unauthenticated usage
	useCdn: true // `false` if you want to ensure fresh data
};


export const client = sanityClient(clientOptions);
export const builder = imageUrlBuilder(client);
