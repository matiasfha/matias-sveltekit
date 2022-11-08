import { client, builder } from '$lib/utils/sanityClient';
import { z } from 'zod';

const Course = z.object({
	title: z.string(),
	updated_at: z.string(),
	category: z.string().nullable(),
	language: z.array(z.string()).length(1),
	type: z.array(z.string()).length(1),
	image: z.object({
		_type: z.string(),
		asset: z.object({
			_ref: z.string(),
			_type: z.string()
		})
	}),
	featured: z.boolean().nullable(),
	url: z.string(),
	description: z.string().nullable()
});

export const Courses = z.array(Course);

function getQuery(lang: string) {
	return `*[_type == "egghead-courses" && language match "${lang}"] | order(updated_at desc)`;
}

const projection = `{
	image, title, category, language, updated_at, type, featured, url, description
  }`;

export default async function getCourses(lang: string) {
	const courses = await client.fetch(`${getQuery(lang)}${projection}`).then((result) => {
		return Courses.parse(result);
	});
	return courses.map((item) => {
		return {
			...item,
			image: builder.image(item.image).url()
		};
	});
}

export async function getLatestCourse(lang: string) {
	const course = await client.fetch(`${getQuery(lang)}[0]${projection}`).then((result) => {
		return Course.parse(result);
	});
	return {
		...course,
		image: builder.image(course.image).url()
	};
}
