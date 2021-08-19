<script lang="ts" context="module">
	export const prerender = true;
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
	import type { Post } from '$lib/types';
	import { afterUpdate } from 'svelte';
	export let posts: Post[];
	export let featured: Post;
	afterUpdate(() => {
		window.algoliasearchNetlify?.({
			appId: '5MKKNKEPXX',
			apiKey: 'd23dfa2b301be4b14a9bb03b5bad2c70',
			siteId: '35f04151-2766-4d52-8b85-4e86ca354007',
			branch: 'main',
			selector: 'div#search'
		});
	});
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/@algolia/algoliasearch-netlify-frontend@1/dist/algoliasearchNetlify.css"
	/>
	<script
		type="text/javascript"
		src="https://cdn.jsdelivr.net/npm/@algolia/algoliasearch-netlify-frontend@1/dist/algoliasearchNetlify.js"></script>
</svelte:head>

<Featured image={featured.banner} title={featured.title} url={`/blog/post/${featured.slug}`} />

<div id="search" />

<section class="mt-12">
	<h2 class="leading-tight text-2xl md:text-3xl my-12 dark:text-white">Blog Posts</h2>
	<div class="grid md:grid-cols-2 grid-cols-1 md:gap-16 gap-8">
		{#each posts as post}
			<PostCard {post} />
		{/each}
	</div>
</section>
