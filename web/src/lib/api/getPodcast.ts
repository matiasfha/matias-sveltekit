import Parser from 'rss-parser';
import z, { string } from 'zod';

const Item = z.object({
	link: z.string(),
	title: z.string(),
	pubDate: z.string(),
	contentSnippet: z.string(),
	isoDate: z.string(),
	itunes: z.object({
		duration: z.string(),
		image: z.string()
	})
});

const Items = z.array(Item);
const parser = new Parser();

export async function getAll(feedURL: string) {
	try {
		const result = await parser.parseURL(feedURL).then((result) => Items.parse(result.items));

		return result.map((item) => {
			return {
				url: item.link,
				duration: item.itunes.duration,
				image: item.itunes.image,
				title: item.title
			};
		});
	} catch (e) {
		console.error(e);
		return [];
	}
}

export async function getLatest(feedURL: string) {
	const items = await getAll(feedURL);

	return items?.[0];
}
