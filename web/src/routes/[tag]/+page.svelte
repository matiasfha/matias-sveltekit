<script lang="ts">
	// Suggestion (check code before using, and possibly convert to data.X access later):
	import type { PageData } from './$types';
	export let data: PageData;
	import PostCard from '$components/PostCard.svelte';
	import Seo from '$components/Seo.svelte';
	import { t } from '$lib/translations';
    import { page } from '$app/stores';
	
	import type { Post } from '$lib/types';

	import { Cloudinary } from 'cloudinary-core'
	import { browser } from '$app/environment';
	import { afterUpdate } from 'svelte';
	import { HtmlTag } from 'svelte/internal';
	
	afterUpdate(() => {
		if(browser) {
			const cl = Cloudinary.new({ cloud_name: 'matiasfha' });
			cl.responsive()
		}
	})
		
	
	let searchItem: string;
    let currentTag = $page.params.tag.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
	
	$: filteredPosts = searchItem
		? data.posts.filter((item: Post) => {
				const title = item.title?.toLowerCase() ?? '';
				const keywords = item.keywords;
				return (
					title.includes(searchItem.toLowerCase()) || keywords?.includes(searchItem.toLowerCase())
				);
		  })
		: data.posts;
</script>

<Seo title={currentTag} description={`All about ${currentTag}`} canonical="https://matiashernandez.dev/blog" />

<header
	class="post-header w-full bg-gray-900 flex item-end flex-col justify-center relative h-[20rem] bg-cover bg-no-repeat rounded-md"
>
	<div class="backdrop-blur-sm  w-full absolute top-0 left-0 z-0 h-full" />
	<div class="flex flex-col z-10 px-4 md:px-2">
		<h1 class="text-left text-gray-100 font-bold text-2xl md:text-4xl pb-8 m-0 ">
			{currentTag}
		</h1>
		<p
			class="text-left text-gray-100 font-body leading-tight text-lg max-w-4xl z-10 hidden md:block flex-grow m-0"
		>
			{$t('common.all_about')} {currentTag}
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



<div class="flex flex-row mt-12">
	<input
		type="text"
		placeholder={$t('common.search')}
		aria-label={$t('common.search')}
		class="border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-6 w-full dark:text-white bg-transparent border rounded-lg focus:outline-none"
		bind:value={searchItem}
	/>
</div>


<section class="mt-12">
	<h2 class="leading-tight text-2xl md:text-3xl my-12 dark:text-white">{$t('blog.title')}</h2>
	<div class="grid md:grid-cols-3 grid-cols-1 md:gap-16 gap-8 transition duration-150 ease-in-out">
		{#each filteredPosts as post}
			<PostCard {post} />
		{/each}
	</div>
</section>


<style>
	header {
		background-image: url('/typewriter.jpeg');
	}
</style>
