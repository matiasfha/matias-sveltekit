import getCourses from '$api/getEggheadCourses';

export async function load() {
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
}
