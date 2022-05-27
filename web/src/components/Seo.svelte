<script lang="ts">
	import getOgImage from '$lib/utils/getOgImage';
	export let title: string;
	export let description: string = undefined;
	export let keywords: string[] = undefined;
	export let canonical: string = undefined;
	export let isBlogPost: boolean = false;
	let slug = '/';
	let siteUrl = 'https://matiashernandez.dev';
	const image = getOgImage({ text: title, tags: keywords ?? [] });
	console.log({ title });
	if (isBlogPost) {
		slug = title.toLowerCase().split(' ').join('-');
		siteUrl = `https://matiashernandez.dev/blog/post/${slug || ''}`;
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="twitter:creator" content="https://twitter.com/matiasfha/" />
	<meta property="og:type" content={isBlogPost ? 'article' : 'website'} />
	<meta name="robots" content="index, follow" />
	<meta name="googlebot" content="index,follow" />
	<meta name="twitter:site" content={siteUrl} />
	<meta property="og:site_name" content={siteUrl} />
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
		<meta name="twitter:description" content={description} />
	{/if}
	{#if canonical}
		<link rel="canonical" href={canonical} />
		<meta property="og:url" content={canonical} />
	{:else}
		<link rel="canonical" href={siteUrl} />
		<meta property="og:url" content={siteUrl} />
	{/if}
	{#if keywords}
		<meta name="keywords" content={keywords.join(', ')} />
	{/if}
	<meta property="og:title" content={title} />
	<meta property="og:image" content={image} />
	<meta property="og:image:alt" content={title} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:image" content={image} />
</svelte:head>
