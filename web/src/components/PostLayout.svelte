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

	let currentUrl;
	afterUpdate(() => {
		currentUrl = window.location.href;
	});
</script>

<Seo {title} {description} {keywords} isBlogPost={true} />
<main class="w-full pb-4 px-0 md:px-8">
	<header
		class="post-header w-full bg-gray-900 flex item-end flex-col justify-center relative md:h-[32rem] h-[20rem]"
	>
		<img
			src={banner}
			class=" overflow-cover w-full absolute top-0 left-0 z-0 max-h-[32rem] filter blur-sm"
			alt={title}
		/>
		<div class="flex flex-col max-w-3xl z-10  self-end mr-12">
			<h1 class="text-left text-gray-100 font-bold text-xl md:text-3xl pb-8 m-0 px-4 md:px-0">
				{title}
			</h1>
			<p
				class="text-left text-gray-100 font-body leading-tight text-lg max-w-4xl z-10 hidden md:block flex-grow m-0"
			>
				{description}
			</p>
			<h4
				class="text-left text-gray-100 font-body leading-tight text-sm self-end absolute bottom-2 left-2 md:left-auto"
			>
				{@html bannerCredit}
			</h4>
		</div>
	</header>
	<article
		class="dark:text-gray-300 text-ebony-clay-800 py-12 mx-auto container max-w-6xl prose prose-lg dark:prose-dark mt-12 pt-[14rem] md:pt-[32rem]"
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
				href="/">Editar en GitHub</a
			>
		</div>
	</footer>
</main>

<style>
	.post-header {
		position: absolute;
		top: 0;
		left: 0;
		z-index: -1;
	}
	.post-header::after {
		width: 60vw;
		content: '';
		position: absolute;
		right: 0;
		top: 0;
		height: 100%;
		background: #111;
		opacity: 0.85;
		display: block;
		z-index: 5;
		mix-blend-mode: multiply;
		transform: skew(15deg, 0deg);
		transform-origin: top right;
	}
	@media (max-width: 767px) {
		.post-header::after {
			transform: none;
		}
	}
</style>
