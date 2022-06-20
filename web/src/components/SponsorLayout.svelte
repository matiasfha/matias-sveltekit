<script context="module">
	import { blockquote, h1 } from '$components/typography/index';
	export { blockquote, h1 };
	export const prerender = true;
</script>

<script lang="ts">
	import Seo from '$components/Seo.svelte';
	
</script>

<Seo
	title="Matias Hernández | Sponsorhips"
	keywords={[
		'Matias',
		'Developer',
		'Engineer',
		'Chile',
		'Sponsorships',
		'Auspiciadores',
		'Auspicios',
		'Sponsors',
		'Desarrolladores',
		'Audiencia',
		'Audience'
	]}
	description="Become a sponsor and advertise your product or service to an audience of over 6,000 web developers."
/>

<header
	class="w-full h-60 md:h-56 bg-no-repeat absolute left-0 bg-cover flex flex-col md:flex-row justify-center items-center px-2 gap-8"
>
	<h1
		class="text-gray-200 text-center text-2xl md:text-5xl font-bold tracking-tight w-full md:w-2/3"
	>
		Sponsorship and advertising
	</h1>
	<p class="text-gray-200 w-3/4 md:w-1/4 text-sm md:text-lg font-body">
		Become a sponsor and advertise your product or service to an audience of over 6,000 web developers.
	</p>
</header>

<article
	class="dark:text-gray-300 text-ebony-clay-800  mx-auto container max-w-6xl prose prose-lg dark:prose-dark pt-[20rem]"
>
	<slot />
</article>

<style>
	header {
		background-image: url('/sponsors.png');
	}
</style>
