<script lang="ts">
	import type { ContentElement } from 'src/types';

	export let favorites: ContentElement[];
</script>

<section class="mt-24">
	<h2
		class="text-3xl md:text-4xl sm:font-semibold font-bold mb-3 dark:text-white text-ebony-clay-800s"
	>
		Picks and Favorites
	</h2>
	<div class="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-4">
		{#each favorites as item}
			<div
				class="bg-white dark:bg-gray-800 dark:text-gray-200 shadow-sm rounded-lg overflow-hidden p-5 text-center hover:ring-2 dark:ring-yellow-50 ring-green-400 ring-offset-2"
			>
				<a href="/" class="focus:outline-none">
					<div class="h-64 flex items-center justify-center mb-12 rounded-lg overflow-hidden">
						<img
							alt=""
							aria-hidden="true"
							role="presentation"
							src={item.image}
							class="rounded-lg object-cover h-64 w-full"
						/>
					</div>
				</a>
				<div>
					<h3
						class="text-lg md:text-xs text-green-600 dark:text-green-300 m-0 md:mb-2 md:mt-1 text-body text-left md:text-center"
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
