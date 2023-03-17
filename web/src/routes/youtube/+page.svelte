<script>
	import Featured from '$components/Featured.svelte';
	import NewsletterForm from '$components/NewsletterForm.svelte';
	import RelativeDateFormat from '$components/RelativeDateFormat.svelte';

	import Seo from '$components/Seo.svelte';
	import { t } from '$lib/translations';

	/** @type {import('./$types').PageData} */
	export let data;
	let searchItem;

	$: filteredVideos = searchItem
		? data.videos.filter((item) => {
				const title = item.title?.toLowerCase() ?? '';
				return title.includes(searchItem.toLowerCase());
		  })
		: data.videos;
</script>

<header
	class="post-header w-full bg-gray-900 flex item-end flex-col justify-center relative h-[20rem] bg-cover bg-no-repeat rounded-md"
>
	<div class="backdrop-blur-sm w-full absolute top-0 left-0 z-0 h-full" />
	<div class="flex flex-col z-10 px-4 md:px-2">
		<h1 class="text-left text-gray-100 font-bold text-2xl md:text-4xl pb-8 m-0 ">Youtube Videos</h1>
		<p
			class="text-left text-gray-100 font-body leading-tight text-lg max-w-4xl z-10 hidden md:block flex-grow m-0"
		/>
		<h4
			class="text-left text-gray-100 font-body leading-tight text-sm self-end absolute bottom-2 left-2 md:left-auto"
		>
			Photo by <a
				href="https://unsplash.com/@vmxhu?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
				>Szabo Viktor</a
			>
			on
			<a
				href="https://unsplash.com/s/photos/youtube?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
				>Unsplash</a
			>
		</h4>
	</div>
</header>

<Seo
	title="Matias Hernández | Youtube Content"
	keywords={[
		'Videos',
		'How to',
		'Tutorials',
		'React',
		'Typescript',
		'Svelte',
		'SvelteKit',
		'Cursos',
		'Aprende React'
	]}
	description={'Subscribe to my youtube channel to learn about Typescript, Javascript, web dev and more'}
	canonical="https://matiashernandez.dev/youtube"
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
		class="shadow-md border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-6 w-full bg-gray-50 border rounded-lg focus:outline-none text-ebony-clay-700"
		bind:value={searchItem}
	/>
</div>
<section class="mt-12">
	<h2 class="leading-tight text-2xl md:text-3xl my-12 dark:text-white">{$t('articles.title')}</h2>
	<div class="grid md:grid-cols-3 grid-cols-1 md:gap-16 gap-8">
		{#each filteredVideos as content}
			<a
				class="group peer relative block w-full focus:outline-none"
				href={`https://youtube.com/watch?v=${content.id}`}
			>
				<div
					class="aspect-w-2 aspect-h-1 h-1/4 rounded-lg transition group-hover:ring-2 dark:ring-yellow-50 ring-green-400 ring-offset-2"
				>
					<img
						src={content.thumb.url}
						data-src={content.thumb.url}
						width={content.thumb.width}
						loading="lazy"
						alt={content.title}
						class="rounded-lg object-cover cld-responsive"
						decoding="async"
					/>
				</div>
				<div class="mt-8 dark:text-gray-300 text-gray-500 text-md font-medium lowercase text-body">
					<RelativeDateFormat date={content.publishedAt} />
				</div>
				<h2 class="md:text-2xl text-xl font-bold leading-tighter text-black dark:text-white ">
					{content.title}
				</h2>
			</a>
		{/each}
	</div>
</section>

<style>
	header {
		background-image: url('/youtube.jpg');
	}
</style>
