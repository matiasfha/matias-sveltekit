<script lang="ts">
	import type { Latest } from 'src/types';

	export let latest: Latest[];
</script>

<section class="mt-24">
	<h2 class="leading-tight text-2xl md:text-3xl mb-3 dark:text-white text-ebony-clay-800s">
		Latest
	</h2>
	<div class="grid md:grid-cols-2 grid-cols-1 md:gap-16 gap-8">
		{#each latest as item}
			<div class="flex flex-col">
				<div class="md:mb-4 mb-2">
					<a class="group peer relative block w-full focus:outline-none" href={item.href}
						><div
							class="aspect-w-2 aspect-h-1 focus:ring w-full rounded-lg transition group-hover:ring-2 ring-yellow-50 ring-offset-2"
						>
							<img alt={item.title} class="rounded-lg object-cover" src={item.image} />
						</div>

						<div
							class="mt-8 dark:text-gray-300 text-ebony-clay-800 text-md font-medium capitalize text-body"
						>
							{item.tag}
						</div>
						<div class="text-2xl font-medium md:text-3xl text-black dark:text-white mt-4">
							{item.title}
						</div></a
					>
				</div>
			</div>
		{/each}
	</div>
</section>
