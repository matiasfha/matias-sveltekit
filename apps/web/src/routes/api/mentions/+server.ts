import { json as json$1 } from '@sveltejs/kit';

import type { RequestHandler } from './$types';
import sanitizeHTML from 'sanitize-html';
import z from 'zod';

const Entry = z.object({
	type: z.string(),
	author: z.object({
		type: z.string(),
		name: z.string(),
		photo: z.string(),
		url: z.string()
	}),
	url: z.string(),
	published: z.string(),
	'wm-received': z.string(),
	'wm-id': z.number(),
	'wm-source': z.string(),
	'wm-target': z.string(),
	content: z.object({
		text: z.string().optional(),
		type: z.string().optional(),
		value: z.string().optional()
	}),
	'repost-of': z.string(),
	'wm-property': z.string(),
	'wm-private': z.boolean()
});

type Entry = z.infer<typeof Entry>;

const Feed = z.object({
	type: z.string(),
	name: z.string(),
	children: z.array(Entry)
});
const API = 'https://webmention.io/api';
const TOKEN = 'T5G3bNBj1mBEuj4PYST_ww';
const domain = 'matiashernandez.dev';

const likes = ['like-of'];
const retweet = ['repost-of'];

const hasRequiredFields = (entry: Entry) => {
	const { author, published, content } = entry;
	return author.name && published && content;
};
const sanitize = (entry: Entry) => {
	const { content } = entry;
	if (content['content-type'] === 'text/html') {
		content.value = sanitizeHTML(content.value);
	}
	return entry;
};

export const GET: RequestHandler = async ({ url }) => {
	const { search } = url;
	const params = search.split('?url=')[1];
	const target = 'https://matiashernandez.dev' + decodeURIComponent(params) + '/';

	const webmentions = `${API}/mentions.jf2?domain=${domain}&token=${TOKEN}&target=${target}`;

	const response = await fetch(webmentions);
	if (response.ok) {
		const data = await response.json();
		const feed = Feed.parse(data);

		return json$1({
			likes: feed.children
				.filter((entry) => entry['wm-target'] === target)
				.filter((entry) => likes.includes(entry['wm-property'])),
			retweet: feed.children
				.filter((entry) => entry['wm-target'] === target)
				.filter((entry) => retweet.includes(entry['wm-property']))
				.filter(hasRequiredFields)
				.map(sanitize)
		});
	}
	return json$1({
		feed: []
	});
};
