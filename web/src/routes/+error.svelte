<script>
	import { page } from '$app/stores';
	import PostCard from '$components/PostCard.svelte';
	import { t } from '$lib/translations';
	import NewsletterForm from '$components/NewsletterForm.svelte';
	import Seo from '$components/Seo.svelte';

	const posts = JSON.parse($page.error.message);
</script>

<Seo
	title="Lo siento: 404"
	description="Lo siento pero la página que buscabas no existe"
	canonical="https://matiashernandez.dev"
/>

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
		src="https://res.cloudinary.com/matiasfha/image/upload/f_auto,q_auto/v1668110744/iu_u4ycpp.jpg"
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

<NewsletterForm />
