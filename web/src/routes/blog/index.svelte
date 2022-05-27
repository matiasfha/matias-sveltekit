<script lang="ts" context="module">
	export async function load({ fetch }) {
		const url = '/api/blog.json';
		const res = await fetch(url);
		if (res.ok) {
			const { posts, featured } = await res.json();

			return {
				props: {
					posts,
					featured
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script>

<script lang="ts">
	import Featured from '$components/Featured.svelte';
	import PostCard from '$components/PostCard.svelte';
	import Seo from '$components/Seo.svelte';
	import type { Post } from '$lib/types';
	export let posts: Post[];
	export let featured: Post;
	let searchItem: string;

	$: filteredPosts = searchItem
		? posts.filter((item: Post) => {
				const title = item.title?.toLowerCase() ?? '';
				const keywords = item.keywords;
				return (
					title.includes(searchItem.toLowerCase()) || keywords?.includes(searchItem.toLowerCase())
				);
		  })
		: posts;
</script>

<Seo title="Matias Hernández | Blog" description="Mi blog personal" />
<Featured image={featured.banner} title={featured.title} url={`/blog/post/${featured.slug}`} />

<div class="flex flex-row mt-12">
	<input
		type="text"
		name="firstName"
		autocomplete="name"
		placeholder="Search"
		aria-label="Search"
		class="border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-6 w-full dark:text-white bg-transparent border rounded-lg focus:outline-none"
		bind:value={searchItem}
	/>
</div>

<section class="mt-12">
	<h1 class="leading-tight text-2xl md:text-3xl my-12 dark:text-white">Blog Posts</h1>
	<div class="grid md:grid-cols-3 grid-cols-1 md:gap-16 gap-8 transition duration-150 ease-in-out">
		{#each filteredPosts as post}
			<PostCard {post} />
		{/each}
	</div>
</section>
