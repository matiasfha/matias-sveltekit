
<script lang="ts">
	// Suggestion (check code before using, and possibly convert to data.X access later):
	import type { PageData } from './$types';
	export let data: PageData;
	import Featured from '$components/Featured.svelte';
	import PostCard from '$components/PostCard.svelte';
	import Seo from '$components/Seo.svelte';
	import { t } from '$lib/translations';
	import { format } from 'date-fns'

	import type { Post } from '$lib/types';

	import { Cloudinary } from 'cloudinary-core'
	import { browser } from '$app/env';
	import { afterUpdate } from 'svelte';
	
	afterUpdate(() => {
		if(browser) {
			const cl = Cloudinary.new({ cloud_name: 'matiasfha' });
			cl.responsive()
		}
	})
		
	
	

	let searchItem: string;
	
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
image={data.featured.banner} title={data.featured.title} url={data.featured.slug} 
meta={format(new Date(data.featured.date), 'dd/MM/yyyy')}
description={data.featured.description}
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
