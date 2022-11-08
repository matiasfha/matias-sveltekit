import type { ContentElement } from '$lib/types';

type FavoriteSource = Omit<ContentElement, 'image'> & {
	image: {
		asset: {
			url: string;
		};
	};
};

import { client, builder } from '$lib/utils/sanityClient';
export default async function getFavorites(lang: string): Promise<Array<ContentElement>> {
	const query = `*[_type == "favorites" && language match "${lang}"]`;
	const favorites = await client.fetch<FavoriteSource[]>(query);
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
