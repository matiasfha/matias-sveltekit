<script lang="ts">
	import type { ContentElement } from '$lib/types';
	import Image from './Image.svelte';
	import { t } from '$lib/translations';
	export let favorites: ContentElement[];
</script>

<section class="mt-24">
	<h2
		class="text-3xl md:text-4xl sm:font-semibold font-bold mb-3 dark:text-white text-ebony-clay-800s"
	>
		{$t('home.selected')}
	</h2>
	<div class="grid md:grid-cols-2 grid-cols-1 gap-4">
		{#each favorites as item}
			<div
				class="bg-white dark:bg-gray-800 dark:text-gray-200 shadow-sm rounded-lg overflow-hidden p-5 text-center hover:ring-2 dark:ring-yellow-50 ring-green-400 ring-offset-2"
			>
				<a href="/" class="focus:outline-none block w-fuill">
					<div class="aspect-w-2 aspect-h-1 h-64 flex items-center justify-center mb-12 rounded-lg overflow-hidden">
						<Image
							height="256"
							alt={item.title}
							aria-hidden="true"
							src={item.image}
							classes="rounded-lg object-cover h-64 w-full"
						/>
					</div>
				</a>
				<div>
					<h3
						class="text-lg md:text-xs text-green-600 dark:text-green-300 m-0 md:mb-2 md:mt-1 text-body text-left md:text-center capitalize"
					>
						{item.tag}
					</h3>
					<a href={item.url}
						><h2 class="text-lg font-bold leading-tighter py-3 text-left md:text-center">
							{item.title}
						</h2></a
					>
				</div>
			</div>
		{/each}
	</div>
</section>
