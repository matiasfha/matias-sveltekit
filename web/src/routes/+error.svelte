<script>
	import { page } from '$app/stores';
	import PostCard from '$components/PostCard.svelte';
	import { t } from '$lib/translations';
	const posts = JSON.parse($page.error.message);
</script>

<section class="mt-12 mx-auto prose prose-lg flex-col items-center flex ">
	<h2
		class="leading-tight sm:font-semibold font-bold text-3xl md:text-4xl mb-3 dark:text-white text-ebony-clay-600"
	>
		{$t('common.404.title')}
	</h2>
	<img
		alt="Last page of the internet"
		loading="lazy"
		class="w-1/2 mt-4"
		src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.makeuseof.com%2Fwp-content%2Fuploads%2F2013%2F06%2Fhmpg.jpg&f=1&nofb=1&ipt=861508bff7a036025b7d69a64f4fc3e54435c5c1922795b20b921720347006a0&ipo=images"
	/>
</section>
<section class="mt-12">
	<h3
		class="leading-tight font-semibold text-3xl md:text-2xl py-20 dark:text-white text-ebony-clay-600"
	>
		{$t('common.404.read_more')}
	</h3>
	<div class="grid md:grid-cols-3 grid-cols-1 md:gap-16 gap-8 transition duration-150 ease-in-out">
		{#each posts as post}
			<PostCard {post} />
		{/each}
	</div>
</section>
