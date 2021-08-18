<script lang="ts" context="module">
	export const prerender = true;
	export async function load({ fetch }) {
		const url = '/api/blog.json';
		const res = await fetch(url);
		if (res.ok) {
			const posts = await res.json();
			return {
				props: {
					posts
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
	import type { Post } from 'src/types';
	import { afterUpdate } from 'svelte';
	export let posts: Post[];

	afterUpdate(() => {
		window?.algoliasearchNetlify?.({
			appId: '5MKKNKEPXX',
			apiKey: '<YOUR_ALGOLIA_SEARCH_API_KEY>',
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

<Featured
	image="https://res.cloudinary.com/matiasfha/image/upload/v1604323837/monirul-islam-shakil-31I2Mi1UuxQ-unsplash_kkerl8.jpg"
	title="React useEffect ¿Por que el arreglo de dependencias es importante?"
	url="http://localhost:3000/blog/post/react-useeffect-hook-comparado-con-los-estados-del-ciclo-de-vida"
/>

<div id="search" />

<section class="mt-12">
	<h2 class="leading-tight text-2xl md:text-3xl my-12 dark:text-white">Blog Posts</h2>
	<div class="grid md:grid-cols-2 grid-cols-1 md:gap-16 gap-8">
		{#each posts as post}
			<PostCard {post} />
		{/each}
	</div>
</section>
