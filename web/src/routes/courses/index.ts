import getCourses from '$api/getEggheadCourses';

export async function GET() {
	try {
		const courses = await getCourses();
		return {
			status: 200,
			body: {
				courses
			}
		};
	} catch (e) {
		return {
			status: 500,
			message: e.message,
			error: new Error(`Could not load courses`)
		};
	}
}
