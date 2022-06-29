<script context="module">
	import { blockquote, h1 } from '$components/typography/index';
	export { blockquote, h1 };
	export const hydrate = false;
	export const prerender = true;
</script>

<script>
	import Seo from './Seo.svelte';
	export let title;
	export let description;
</script>

<Seo {title} {description} />

<main class="w-full pb-4 px-8">
	<article
		class="dark:text-gray-300 text-ebony-clay-800 py-12 mx-auto container max-w-6xl prose prose-lg  mt-12 "
	>
		<slot />
	</article>
</main>
