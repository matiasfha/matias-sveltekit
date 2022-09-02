import type { PageServerLoad } from './$types';
import getCourses from '$lib/api/getEggheadCourses';

export const load: PageServerLoad = async () => {
	try {
		const courses = await getCourses();
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
