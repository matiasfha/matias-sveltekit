<script context="module">
	import { blockquote } from '$components/typography/index';
	
	export { blockquote };
	export const hydrate = false;
	export const prerender = true;
</script>

<script>
	import Seo from './Seo.svelte';
	export let title;
	export let description;
</script>

<Seo {title} {description} />
<!--INFOLINKS_OFF-->
<main class="w-full pb-4 px-8">
	<article
		class="dark:text-gray-300 text-ebony-clay-800 py-12 mx-auto container max-w-6xl prose prose-lg  mt-12 "
	>
		<slot />
	</article>
</main>
