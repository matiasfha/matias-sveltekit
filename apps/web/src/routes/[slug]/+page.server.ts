import type { PageServerLoad } from './$types';
import { builder, client } from '$lib/utils/sanityClient';
import z from 'zod';
import { error } from '@sveltejs/kit';
import getPosts from '$lib/api/getPosts';

const Page = z.object({
	text: z.any(),
	title: z.string(),
	keywords: z.array(z.string()).nullable(),
	description: z.string().nullable(),
	header: z
		.object({
			asset: z
				.object({
					_ref: z.string()
				})
				.nullable()
		})
		.nullable()
});

async function getPage({ lang, slug }: { lang: string; slug: string }) {
	const res = await client.fetch(
		`*[_type == "page" && slug == "${slug}" && language match "${lang}"][0]{
            text, title, keywords, description, header
        }`
	);
	return res;
}

export const load: PageServerLoad = async ({ params, cookies }) => {
	const { slug } = params;

	const lang = cookies.get('lang') ?? 'en';
	const result = await getPage({ lang, slug });
	if (result) {
		const page = Page.parse(result);
		return {
			// content: compiled.code,
			...page,
			header: page.header ? builder.image(page.header).url() : null,
			slug
		};
	}
	const posts = (await getPosts(lang)).slice(0, 3);
	throw error(404, {
		message: JSON.stringify(posts)
	});
};
