<script context="module">
	import { blockquote } from '$lib/components/typography/index';
	import Codesandbox from './mdx/Codesandbox.svelte';
	import EggheadLesson from './mdx/EggheadLesson.svelte';
	export { blockquote, Codesandbox, EggheadLesson };
</script>

<script>
	import Seo from './Seo.svelte';
	export let banner;
	export let bannerCredit;
	export let title;
	export let description;
	export let keywords;
</script>

<Seo {title} {description} {keywords} isBlogPost={true} />
<main class="w-full pb-4">
	<header
		class="post-header w-full bg-gray-900 flex items-start flex-col justify-center relative h-[32rem]"
	>
		<img
			src={banner}
			class="object-cover w-full absolute top-0 left-0 z-0 max-h-96 filter blur-sm"
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
	<article class="text-gray-100 py-12 mx-auto container max-w-6xl prose lg:prose-lg">
		<slot />
	</article>
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
