<script lang="ts">
	import getOgImage from '$lib/data/getOgImage';
	export let title: string;
	export let description: string = undefined;
	export let keywords: string[];
	export let canonical: string = undefined;
	export let isBlogPost: boolean;
	const slug = title.toLowerCase().split(' ').join('-');
	const image = getOgImage({ text: title, tags: keywords });
	const siteUrl = `https://matiashernandez.dev/blog/post/${slug || ''}`;
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="twitter:creator" content="https://twitter.com/matiasfha/" />
	<meta property="og:type" content={isBlogPost ? 'article' : 'website'} />
	<meta name="robots" content="index, follow" />
	<meta name="googlebot" content="index,follow" />
	<meta name="twitter:site" content={siteUrl} />
	{#if description}
		<meta name="description" content={description} />
	{/if}
	{#if canonical}
		<link rel="canonial" href={canonical} />
	{/if}
	<meta name="keywords" content={keywords.join(', ')} />

	<meta property="og:title" content={title} />
	{#if description}
		<meta property="og:description" content={description} />
	{/if}
	{#if canonical}
		<meta property="og:url" content={canonical} />
	{/if}
	<meta property="og:image" content={image} />
	<meta property="og:image:alt" content={title} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	{#if description}
		<meta name="twitter:description" content={description} />
	{/if}
	<meta name="twitter:image" content={image} />
</svelte:head>
