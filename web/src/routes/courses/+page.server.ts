import type { PageServerLoad } from './$types';
import getCourses from '$lib/api/getEggheadCourses';

export const load: PageServerLoad = async ({ cookies }) => {
	const lang = cookies.get('lang');
	try {
		const courses = await getCourses(lang);
		return {
			courses
		};
	} catch (e) {
		return {
			status: 500,
			errors: {
				error: e
			}
		};
	}
};
