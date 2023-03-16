import type { PageServerLoad } from './$types'; import getPosts from '$lib/api/getPosts';
import type { ServerlessConfig } from '@sveltejs/adapter-vercel'

export const load: PageServerLoad = async ({ cookies }) => {
	const lang = cookies.get('lang');
	const posts = await getPosts(lang);

	const tags = new Set<string>();
	posts.forEach((post) => {
		if (post.tag) {
			tags.add(post.tag);
		}
	});
	return {
		posts,
		featured: posts.find((item) => item.featured),
		tags: [...tags]
	};
};

export const config: ServerlessConfig = {
	runtime: 'nodejs18.x',
	isr: {
		expiration: 60,

	}
}
