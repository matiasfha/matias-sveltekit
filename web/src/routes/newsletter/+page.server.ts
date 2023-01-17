import type { PageServerLoad } from './$types';
import z from 'zod';
import { client, builder } from '$lib/utils/sanityClient';
import { env } from '$env/dynamic/private';

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
		.fetch('*[_type == "microbytes"]{ course, image, tagId, description} | order(tagId, desc)')
		.then((result) => _Newsletters.parse(result));
	return {
		courses: courses.map((item) => ({ ...item, image: builder.image(item.image).url() }))
	};
};
type ConvertKitSubscriber = {
  id: number
  first_name: string
  email_address: string
  state: 'active' | 'inactive'
  created_at: string
  fields: Record<string, string | null>
}
export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('email');
		const sequenceId = data.get('sequenceId')
		const tags = data.get('tags')
		const subscriberData = {
			api_key: env.CONVERT_KIT_API_KEY,
			api_secret: env.CONVERT_KIT_API_SECRET,
			email,
			tags: [...tags, 'Spanish']
		};
		const response = await fetch(
			`https://api.convertkit.com/v3/sequences/${sequenceId}/subscribe`,
			{
				method: 'post',
				body: JSON.stringify(subscriberData),
				headers: { 'Content-Type': 'application/json' }
			}
		);
		const json = (await response.json()) as {
			subscription
		};
		return {
			success: true,
			data: json.subscription
		}
	}
};
