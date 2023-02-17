<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	import { PortableText, DefaultListItem } from '@portabletext/svelte';
	import Pricing from '$components/mdx/Pricing.svelte';
	import BuymeaCoffee from '$components/mdx/BuymeaCoffee.svelte';
	import H1 from '$components/typography/H1.svelte';
	import Quote from '$components/typography/Quote.svelte';
	import Seo from '$components/Seo.svelte';
	import ContactTabs from '$components/ContactTabs/index.svelte';

	let canonical = `https://matiashernandez.dev/${data.slug}`;
</script>

<Seo title={data.title} keywords={data.keywords} description={data.description} {canonical} />
{#if data.header}
	<header
		class="w-full h-60 md:h-56 bg-no-repeat absolute left-0 bg-cover flex flex-col md:flex-row justify-center items-center px-2 gap-8"
		style={`background-image: url('${data.header}');`}
	>
		<h1
			class="text-gray-200 text-center text-2xl md:text-5xl font-bold tracking-tight w-full md:w-2/3"
		>
			{data.title}
		</h1>
		<p class="text-gray-200 w-3/4 md:w-1/4 text-sm md:text-lg font-body">
			{data.description}
		</p>
	</header>
{/if}

{#if data.slug === 'about'}
	<div class="mt-32">
		<ContactTabs />
	</div>
{/if}
<article
	class={`dark:text-gray-300 text-ebony-clay-800 mx-auto container max-w-6xl prose prose-lg dark:prose-dark ${
		data.header ? 'pt-[20rem]' : 'pt-10'
	}`}
>
	<PortableText
		value={data.text}
		components={{
			types: {
				pricing: Pricing,
				buymeacoffee: BuymeaCoffee
			},
			block: {
				h1: H1,
				h2: H1,
				blockquote: Quote
			},
			listItem: {
				normal: DefaultListItem
			}
		}}
	/>
</article>
