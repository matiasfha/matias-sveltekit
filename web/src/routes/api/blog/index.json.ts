import mdsvexConfig from '../../../../mdsvex.config';
export async function get() {
	const extensions = mdsvexConfig.extensions.join(',');

	const modules = import.meta.glob(`../../blog/post/*.mdx`);
	console.log(modules);
	const postPromises = [];
	for (const [path, resolver] of Object.entries(modules)) {
		const promise = resolver().then((post) => ({
			...post.metadata
		}));
		postPromises.push(promise);
	}

	const posts = await Promise.all(postPromises);

	return {
		body: posts
	};
}
