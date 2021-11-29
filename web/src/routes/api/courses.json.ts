import getCourses from '$api/getEggheadCourses';

export async function get() {
	try {
		const courses = await getCourses();
		return {
			body: {
				courses
			}
		};
	} catch (e) {
		console.error(e);
		return {
			status: 500,
			body: e.message
		};
	}
}
