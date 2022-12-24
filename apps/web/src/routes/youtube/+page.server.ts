import { getVideos } from '$lib/api/getYoutubeChannel';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const videos = await getVideos();
		return {
			videos
		};
	} catch (e) {
		return {
			videos: []
		};
	}
};
