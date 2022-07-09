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
	import { t } from '$lib/translations';

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
<!--INFOLINKS_OFF-->
<header
	class="post-header w-full bg-gray-900 flex item-end flex-col justify-center relative h-[20rem] bg-cover bg-no-repeat rounded-md"
>
	<div class="backdrop-blur-sm w-full absolute top-0 left-0 z-0 h-full" />
	<div class="flex flex-col z-10 px-4 md:px-2">
		<h1 class="text-left text-gray-100 font-bold text-2xl md:text-4xl pb-8 m-0 ">
			{$t('articles.title')}
		</h1>
		<p
			class="text-left text-gray-100 font-body leading-tight text-lg max-w-4xl z-10 hidden md:block flex-grow m-0"
		>
			{$t('articles.presentation')}
		</p>
		<h4
			class="text-left text-gray-100 font-body leading-tight text-sm self-end absolute bottom-2 left-2 md:left-auto"
		>
			Photo by <a
				href="https://unsplash.com/@aaronburden?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
				>Aaron Burden</a
			>
			on
			<a
				href="https://unsplash.com/s/photos/writer?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
				>Unsplash</a
			>
		</h4>
	</div>
</header>

<Seo
	title="Matias Hernández | Guest Writing"
	keywords={[
		'Articles',
		'Tech Writing',
		'Tutorials',
		'React',
		'Typescript',
		'Svelte',
		'SvelteKit',
		'Cursos',
		'Aprende React'
	]}
	description={$t('articles.description')}
	canonical="https://matiashernandez.dev/articles"
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
		placeholder={$t('common.search')}
		aria-label="Search"
		class="border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-6 w-full dark:text-white bg-transparent border rounded-lg focus:outline-none"
		bind:value={searchItem}
	/>
</div>
<section class="mt-12">
	<h2 class="leading-tight text-2xl md:text-3xl my-12 dark:text-white">{$t('articles.title')}</h2>
	<div class="grid md:grid-cols-3 grid-cols-1 md:gap-16 gap-8">
		{#each filteredArticles as content}
			<ContentCard {content} />
		{/each}
	</div>
</section>

<style>
	header {
		background-image: url('/writer.jpeg');
	}
</style>
