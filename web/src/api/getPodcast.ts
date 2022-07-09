import Parser from 'rss-parser';
import type { FeedItem, PodcastItem } from '$lib/types';
const parser: Parser<{}, FeedItem> = new Parser();

export async function getAll(feedURL: string): Promise<PodcastItem[]> {
	try {
		const result = await parser.parseURL(feedURL);

		return result.items.map((item) => {
			return {
				...item,
				url: item.link,
				duration: item.itunes.duration,
				image: item.itunes.image,
				season: item.itunes.season,
				episode: item.itunes.episode,
				keywords: item.itunes.keywords
			};
		});
	} catch (e) {
		console.error(e);
		return [];
	}
}

export async function getLatest(feedURL: string): Promise<PodcastItem> {
	const items = await getAll(feedURL);

	return items?.[0];
}
