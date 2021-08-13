<script context="module">
	import { blockquote } from '$components/typography/index';
	import { afterUpdate } from 'svelte';
	export { blockquote };

	export const prerender = true;
</script>

<script>
	import Seo from './Seo.svelte';
	export let banner;
	export let bannerCredit;
	export let title;
	export let description;
	export let keywords;
	export let date;
	let currentUrl;
	afterUpdate(() => {
		currentUrl = window.location.href;
	});
</script>

<Seo {title} {description} {keywords} isBlogPost={true} />
<main class="w-full pb-4">
	<header
		class="post-header w-full bg-gray-900 flex items-start flex-col justify-center relative h-[32rem]"
	>
		<img
			src={banner}
			class=" overflow-cover w-full absolute top-0 left-0 z-0 max-h-[32rem] filter blur-sm"
			alt={title}
		/>
		<h1 class="text-left text-gray-100 font-bold text-3xl max-w-4xl z-10 p-8 px-12">
			{title}
		</h1>
		<h3 class="text-left text-gray-100 font-body leading-tight text-lg max-w-4xl z-10 px-12">
			{description}
		</h3>
		<h4
			class="text-left text-gray-100 font-body leading-tight text-sm max-w-4xl z-10 px-12 absolute bottom-2"
		>
			{@html bannerCredit}
		</h4>
	</header>
	<article
		class="dark:text-gray-300 text-ebony-clay-800 py-12 mx-auto container max-w-6xl prose lg:prose-lg"
	>
		<slot />
	</article>
	<footer class="mx-auto container max-w-6xl flex flex-row justify-end">
		<div class="flex space-x-5 items-center justify-between">
			<a
				class="underlined text-ebony-clay-800 hover:text-ebony-clay-600 dark:text-gray-100 dark:hover:text-gray-200 focus:outline-none"
				href={`https://twitter.com/share?ref_src=twsrc%5Etfw&url=${currentUrl}`}
				>Comparte en Twitter</a
			>
			<a
				class="underlined text-ebony-clay-800 hover:text-ebony-clay-600 dark:text-gray-100 dark:hover:text-gray-200 focus:outline-none"
				href="/">Edit on GitHub</a
			>
		</div>
	</footer>
</main>

<style>
	.post-header::after {
		width: 60vw;
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		background: #111;
		opacity: 0.85;
		display: block;
		z-index: 5;
		mix-blend-mode: multiply;
		transform: skew(-15deg, 0deg);
		transform-origin: top left;
	}
</style>
