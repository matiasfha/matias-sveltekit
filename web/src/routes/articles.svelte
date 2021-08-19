<script lang="ts" context="module">
	export const prerender = true;
	export async function load({ fetch }) {
		const url = '/api/articles.json';
		const res = await fetch(url);
		if (res.ok) {
			const { articles, featured } = await res.json();
			return {
				props: {
					articles,
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
	import ContentCard from '$components/ContentCard.svelte';
	import type { ContentElement } from '$lib/types';
	export let articles: ContentElement[];
	export let featured: ContentElement;
</script>

<Featured
	image={featured.image}
	title={featured.title}
	meta={featured.tag}
	description={featured.description}
	url={featured.url}
/>

<section class="mt-12">
	<h2 class="leading-tight text-2xl md:text-3xl my-12 dark:text-white">Guest Writing</h2>
	<div class="grid md:grid-cols-2 grid-cols-1 md:gap-16 gap-8">
		{#each articles as content}
			<ContentCard {content} />
		{/each}
	</div>
</section>
