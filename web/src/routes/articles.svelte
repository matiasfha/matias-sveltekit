<script lang="ts" context="module">
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
	import Seo from '$components/Seo.svelte';
	import type { ContentElement } from '$lib/types';
	export let articles: ContentElement[];
	export let featured: ContentElement;
	let searchItem: string;

	$: filteredArticles = searchItem
		? articles.filter((item: ContentElement) => {
				const title = item.title?.toLowerCase() ?? '';
				return (
					title.includes(searchItem.toLowerCase()) ||
					item.tag?.toLowerCase()?.includes(searchItem.toLowerCase())
				);
		  })
		: articles;
</script>

<Seo
	title="Matias Hernández | Guest Writing"
	keywords={['Articles', 'Tech Writing', 'Tutorials']}
/>

<Featured
	image={featured.image}
	title={featured.title}
	meta={featured.tag}
	description={featured.description}
	url={featured.url}
/>

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
	<h2 class="leading-tight text-2xl md:text-3xl my-12 dark:text-white">Guest Writing</h2>
	<div class="grid md:grid-cols-3 grid-cols-1 md:gap-16 gap-8">
		{#each filteredArticles as content}
			<ContentCard {content} />
		{/each}
	</div>
</section>
