import Parser from 'rss-parser';
import type { FeedItem, PodcastItem } from '$lib/types';
const parser: Parser<{}, FeedItem> = new Parser();

export async function getAll(feedURL: string): Promise<PodcastItem[]> {
	const result = await parser.parseURL(feedURL);
	return result.items.map((item) => {
		const url = item.enclosure?.url
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
}

export async function getLatest(feedURL: string): Promise<PodcastItem> {
	const items = await getAll(feedURL);

	return items?.[0];
}
