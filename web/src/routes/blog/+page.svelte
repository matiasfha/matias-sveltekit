<script lang="ts">
	// Suggestion (check code before using, and possibly convert to data.X access later):
	import type { PageData } from './$types';
	export let data: PageData;
	import Featured from '$components/Featured.svelte';
	import PostCard from '$components/PostCard.svelte';
	import Seo from '$components/Seo.svelte';
	import { t } from '$lib/translations';

	import { onMount } from 'svelte';
	import type { Posts } from '$lib/api/getPosts';

	let searchItem: string;

	$: filteredPosts = searchItem
		? data.posts.filter((item: typeof Posts.element) => {
				const title = item.title?.toLowerCase() ?? '';
				const keywords = item.keywords;
				return (
					title.includes(searchItem.toLowerCase()) || keywords?.includes(searchItem.toLowerCase())
				);
		  })
		: data.posts;
	let adsbygoogle = [{}];

	onMount(() => {
		if (window.adsbygoogle) {
			adsbygoogle = (window.adsbygoogle || []).push({});
		}
	});
</script>

<svelte:head>
	<script
		defer
		async
		src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8352667732450998"
		crossorigin="anonymous"
	></script>
</svelte:head>

<!--INFOLINKS_OFF-->
<Seo title="Blog" description="Mi blog personal" canonical="https://matiashernandez.dev/blog" />

<header
	class="post-header w-full bg-gray-900 flex item-end flex-col justify-center relative h-[20rem] bg-cover bg-no-repeat rounded-md"
>
	<div class="backdrop-blur-sm  w-full absolute top-0 left-0 z-0 h-full" />
	<div class="flex flex-col z-10 px-4 md:px-2">
		<h1 class="text-left text-gray-100 font-bold text-2xl md:text-4xl pb-8 m-0 ">
			{$t('blog.title')}
		</h1>
		<p
			class="text-left text-gray-100 font-body leading-tight text-lg max-w-4xl z-10 hidden md:block flex-grow m-0"
		>
			{$t('blog.presentation')}
		</p>
		<h4
			class="text-left text-gray-100 font-body leading-tight text-sm self-end absolute bottom-2 left-2 md:left-auto"
		>
			Photo by <a
				href="https://unsplash.com/es/@patrickian4?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
				>Patrick Fore</a
			>
			on
			<a
				href="https://unsplash.com/s/photos/typewriter?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
				>Unsplash</a
			>
		</h4>
	</div>
</header>

<Featured
	image={data.featured.banner}
	title={data.featured.title}
	url={data.featured.slug}
	meta={new Intl.DateTimeFormat('es-CL').format(new Date(data.featured.date))}
	description={data.featured.description}
/>

<div class="flex flex-row mt-12">
	<input
		type="text"
		placeholder={$t('common.search')}
		aria-label={$t('common.search')}
		class="shadow-md border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-6 w-full dark:text-gray-300 bg-gray-50 border rounded-lg focus:outline-none"
		bind:value={searchItem}
	/>
</div>

<section class="mt-12 flex flex-wrap">
	{#each data.tags as tag}
		<a
			href={`/topic/${tag.toLowerCase()}`}
			class="relative mb-4 mr-4 block h-auto w-auto rounded-full px-6 py-3 transition text-primary bg-gray-200 hover:bg-gray-300 text-ebony-clay-500 dark:bg-ebony-clay-500 dark:hover:bg-ebony-clay-400  dark:text-gray-200"
			>{tag}</a
		>
	{/each}
</section>

<section class="mt-12">
	<h2 class="leading-tight text-2xl md:text-3xl my-12 dark:text-white">{$t('blog.title')}</h2>
	<div class="grid md:grid-cols-3 grid-cols-1 md:gap-16 gap-8 transition duration-150 ease-in-out">
		{#each filteredPosts.slice(0, 2) as post}
			<PostCard {post} />
		{/each}
		<ins
			class="adsbygoogle"
			style="display:block"
			data-ad-format="fluid"
			data-ad-layout-key="-6m+d9-39-4m+ov"
			data-ad-client="ca-pub-8352667732450998"
			data-ad-slot="4105180207"
		/>
		{#each filteredPosts.slice(2, filteredPosts.length) as post}
			<PostCard {post} />
		{/each}
		<ins
			class="adsbygoogle"
			style="display:block"
			data-ad-format="fluid"
			data-ad-layout-key="-60+df-3w-7a+132"
			data-ad-client="ca-pub-8352667732450998"
			data-ad-slot="9569259876"
		/>
	</div>
</section>

<style>
	header {
		background-image: url('/typewriter.jpeg');
	}
	.adsbygoogle {
		min-width: 250px;
	}
</style>
