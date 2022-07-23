/** @type {import('./__types/blog/post/mentions').RequestHandler} */

const API = 'https://webmention.io/api';
const TOKEN = 'T5G3bNBj1mBEuj4PYST_ww';
const domain = 'matiashernandez.dev';

export async function GET({ url, ...rest }) {
	const { searchParams } = url;
	//const target = searchParams.get('url');
	const target =
		'https://matiashernandez.dev/blog/post/has-lazy-loading-de-tus-imagenes-simple-y-rapido';
	let webmentions = `${API}/mentions.jf2?target=${target}&sort-by=published&wm-property[]=in-reply-to&wm-property[]=mention-of`;

	const response = await fetch(webmentions);
	if (response.ok) {
		const feed = await response.json();
		console.log(feed);
		return {
			status: 200,
			body: {
				feed
			}
		};
	}
	return {
		status: 200,
		body: {
			feed: []
		}
	};
}
