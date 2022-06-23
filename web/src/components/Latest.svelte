<script lang="ts">
	import type { Latest } from '$lib/types';
	import { t } from '$lib/translations';
	export let latest: Latest[] = [];

</script>

<section class="mt-24">
	<h2
		class="sm:font-semibold font-bold text-3xl md:text-4xl mb-3 dark:text-white text-ebony-clay-800s"
	>
		{$t('home.recent')}
	</h2>
	<div class="grid md:grid-cols-3 grid-cols-1 md:gap-16 gap-20">
		{#each latest as item}
			<div class="group peer flex flex-col ">
				<div class="md:mb-4 mb-2 ">
					<a class="relative block w-full focus:outline-none " href={item.href}
						><div
							class="aspect-w-2 aspect-h-1 w-full rounded-lg focus:ring transition group-hover:ring-2  dark:ring-yellow-50 ring-green-400 ring-offset-2"
						>
							<img
								alt={item.title}
								class="rounded-lg object-cover"
								src={`${item.image}`}
								loading="lazy"
								width="220"
							/>
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
