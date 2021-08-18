import Parser from 'rss-parser';
import type { FeedItem, PodcastItem } from '$lib/types';
const parser: Parser<{}, FeedItem> = new Parser();

export async function getAll(podcastId = '', podcastUrl = ''): Promise<PodcastItem[]> {
	const result = await parser.parseURL(`https://feeds.buzzsprout.com/${podcastId}.rss`);
	return result.items.map((item) => {
		const url = item.enclosure?.url.replace(/\.[^/.]+$/, '').split(podcastId)[1];
		return {
			...item,
			url: `${podcastUrl}/${podcastId}${url}`,
			duration: item.itunes.duration,
			image: item.itunes.image,
			season: item.itunes.season,
			episode: item.itunes.episode,
			keywords: item.itunes.keywords
		};
	});
}

export async function getLatest(podcastId = '', podcastUrl = ''): Promise<PodcastItem> {
	const items = await getAll(podcastId, podcastUrl);

	return items?.[0];
}
