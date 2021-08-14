import getFavorites from '$api/getFavorites';

export async function get() {
	const favorites = await getFavorites();
	return {
		body: favorites
	};
}
