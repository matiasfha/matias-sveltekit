import { json as json$1 } from '@sveltejs/kit';
/** @type {import('./$types').RequestHandler} */
import sanitizeHTML from 'sanitize-html';

const API = 'https://webmention.io/api';
const TOKEN = 'T5G3bNBj1mBEuj4PYST_ww';
const domain = 'matiashernandez.dev';

const likes = ['like-of'];
const retweet = ['repost-of'];
const messages = ['mention-of', 'in-reply-to'];

const hasRequiredFields = (entry) => {
	const { author, published, content } = entry;
	return author.name && published && content;
};
const sanitize = (entry) => {
	const { content } = entry;
	if (content['content-type'] === 'text/html') {
		content.value = sanitizeHTML(content.value);
	}
	return entry;
};

export async function GET({ url }) {
	const { search } = url;
	const params = search.split('?url=')[1];
	console.log(params);
	const target = 'https://matiashernandez.dev' + decodeURIComponent(params) + '/';
	console.log({ target });

	let webmentions = `${API}/mentions.jf2?domain=${domain}&token=${TOKEN}&target=${target}`;

	const response = await fetch(webmentions);
	if (response.ok) {
		const feed = await response.json();

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
}
