export async function get() {
	const modules = import.meta.glob(`../../blog/post/*.mdx`);

	const postPromises = [];
	for (const [path, resolver] of Object.entries(modules)) {
		const promise = resolver().then((post) => {
			const slug = path.match(/([\w-]+)\.(svelte\.md|md|svx)/i)?.[1] ?? null;
			return {
				slug,
				...post.metadata
			};
		});
		postPromises.push(promise);
	}

	const posts = await Promise.all(postPromises);

	return {
		body: posts
	};
}
