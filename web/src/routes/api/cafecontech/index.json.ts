import Parser from 'rss-parser';
const parser = new Parser();

export async function get() {
	const feed = await parser.parseURL('https://feeds.buzzsprout.com/1081172.rss');

	return {
		body: feed.items
	};
}
