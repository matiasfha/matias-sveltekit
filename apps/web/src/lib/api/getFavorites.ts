import { z } from 'zod';
const Favorite = z.object({
	image: z.object({
		_type: z.string(),
		asset: z.object({
			_ref: z.string(),
			_type: z.string()
		})
	}),
	language: z.array(z.string()).length(1),
	tag: z.string(),
	title: z.string(),
	url: z.string()
});

export const Favorites = z.array(Favorite);

import { client, builder } from '$lib/utils/sanityClient';

const getQuery = (lang?: string) => {
	if (lang) {
		return `*[_type == "favorites" && language match "${lang}"]`;
	}
	return `*[_type == "favorites"]`;
};

export default async function getFavorites(lang?: string) {
	const favorites = await client.fetch(getQuery(lang)).then((res) => Favorites.parse(res));

	const sorted = favorites.map((item) => {
		return {
			url: item.url,
			title: item.title,
			image: builder.image(item.image).url(),
			tag: item.tag
		};
	});
	return sorted;
}
