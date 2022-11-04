import type { PageServerLoad } from './$types';
import getPosts from '$lib/api/getPosts';
import getCourses from '$lib/api/getEggheadCourses';

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
export const load: PageServerLoad = async ({ params }) => {
	const { tag } = params;
	const posts = await getPosts();
	const courses = await getCourses();
	const query = `*[_type == "external-articles" && category match '${tag}']`;
	const res = await client.fetch(query);
	const articles = res.map((item) => {
		return {
			...item,
			image: builder.image(item.image).url(),
			featured: false
		};
	});
	const c = courses.reduce((acc, current) => {
		const valid = current.tags.find((t) => t.name === tag);
		if (valid) {
			acc.push(current);
		}
		return acc;
	}, []);

	return {
		posts: posts.filter((item) => item.tag?.toLowerCase() === tag),
		courses: c,
		articles
	};
};
