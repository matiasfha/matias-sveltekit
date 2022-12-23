import type { PageServerLoad } from './$types';
import z from 'zod';
import { client, builder } from '$lib/utils/sanityClient';

const Source = z.object({
	course: z.string(),
	image: z.object({
		asset: z.object({
			_ref: z.string()
		})
	}),
	tagId: z.string().nullable(),
	description: z.any()
});

export const _Newsletters = z.array(Source);

export const load: PageServerLoad = async () => {
	const courses = await client
		.fetch('*[_type == "microbytes"]{ course, image, tagId, description}')
		.then((result) => _Newsletters.parse(result));
	return {
		courses: courses.map((item) => ({ ...item, image: builder.image(item.image).url() }))
	};
};
