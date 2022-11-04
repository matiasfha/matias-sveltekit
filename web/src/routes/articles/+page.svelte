<script>
	/** @type {import('./$types').PageData} */
	export let data;
	
	import Featured from '$components/Featured.svelte';
	import ContentCard from '$components/ContentCard.svelte';
	import Seo from '$components/Seo.svelte';
	import { t } from '$lib/translations';
	import NewsletterForm from '$components/NewsletterForm.svelte';
	/** @type { string }*/
	let searchItem;

	$: filteredArticles = searchItem
		? data.articles.filter((item) => {
				const title = item.title?.toLowerCase() ?? '';
				return (
					title.includes(searchItem.toLowerCase()) ||
					item.tag?.toLowerCase()?.includes(searchItem.toLowerCase())
				);
		  })
		: data.articles;
	
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
	image={data.featured.image}
	title={data.featured.title}
	meta={data.featured.tag}
	description={data.featured.description}
	url={data.featured.url}
/>

<NewsletterForm />

<div class="flex flex-row mt-12">
	<input
		type="text"
		placeholder={$t('common.search')}
		aria-label={$t('common.search')}
		class="shadow-md border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-6 w-full dark:text-white bg-gray-50 border rounded-lg focus:outline-none"
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
