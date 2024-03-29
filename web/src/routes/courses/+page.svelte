<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	import Featured from '$components/Featured.svelte';
	import Seo from '$components/Seo.svelte';
	import { t } from '$lib/translations';

	const featured = data.courses.find((item) => item.featured);

	let searchItem: string;

	$: filteredCourse = searchItem
		? data.courses.filter((item) => {
				const title = item.title?.toLowerCase() ?? '';
				return title.includes(searchItem.toLowerCase());
		  })
		: data.courses;
</script>

<Seo
	title="Courses"
	keywords={['Courses', 'Javascript', 'Tutorials', 'Instructor', 'React', 'egghead.io']}
	description="Course materials for egghead.io"
	canonical="https://matiashernandez.dev/courses"
/>

<header
	class="post-header w-full bg-gray-900 flex item-end flex-col justify-center relative h-[20rem] bg-cover bg-no-repeat rounded-md"
>
	<div class="backdrop-blur-sm  w-full absolute top-0 left-0 z-0 h-full" />
	<div class="flex flex-col z-10 px-4 md:px-2">
		<h1 class="text-left text-gray-100 font-bold text-2xl md:text-4xl pb-8 m-0 ">
			{$t('common.courses')}
		</h1>
		<p
			class="text-left text-gray-100 font-body leading-tight text-lg max-w-4xl z-10 hidden md:block flex-grow m-0"
		>
			{$t('courses.presentation')}
		</p>

		<h4
			class="text-left text-gray-100 font-body leading-tight text-sm self-end absolute bottom-2 left-2 md:left-auto"
		>
			Photo by <a
				href="https://unsplash.com/@itfeelslikefilm?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
				>🇸🇮 Janko Ferlič</a
			>
			on
			<a
				href="https://unsplash.com/s/photos/learning?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
				>Unsplash</a
			>
		</h4>
	</div>
</header>

<Featured
	image={featured.image}
	title={featured.title}
	meta={featured.type}
	url={featured.url}
	description={featured.description}
/>
<div class="flex flex-row mt-12">
	<input
		type="text"
		placeholder={$t('common.search')}
		aria-label={$t('common.search')}
		class="shadow-md border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-6 w-full dark:text-white bg-gray-50 border rounded-lg focus:outline-none"
		bind:value={searchItem}
	/>
</div>

<section class="mt-24">
	<h2 class="leading-tight text-3xl md:text-4xl mb-3 dark:text-white text-ebony-clay-800s">
		{$t('common.courses')}
	</h2>
	<div class="grid md:grid-cols-3 grid-cols-1 md:gap-16 gap-20">
		{#each filteredCourse as item}
			<div class="group peer flex flex-col ">
				<div class="md:mb-4 mb-2 ">
					<a class="relative block w-full focus:outline-none " href={`${item.url}?af=4cexzz`}
						><div
							class="aspect-w-2 aspect-h-1 w-full rounded-lg focus:ring transition group-hover:ring-2 ring-yellow-50 ring-offset-2"
						>
							<img
								alt={item.title}
								class="rounded-lg object-cover"
								src={`${item.image}`}
								loading="lazy"
								width="220"
							/>
						</div>

						<div
							class="mt-8 text-ebony-clay-800 text-md font-medium capitalize text-body py-1 px-2 rounded bg-green-400 inline-block w-[max-content]"
						>
							{item.type}
						</div>
						<div class="text-2xl font-medium md:text-3xl text-black dark:text-white mt-4">
							{item.title}
						</div></a
					>
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	header {
		background-image: url('/courses.jpeg');
	}
</style>
