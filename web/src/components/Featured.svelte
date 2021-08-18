<script lang="ts">
	import Buzzsprout from './mdx/Buzzsprout.svelte';
	export let image: string;
	export let title: string;
	export let meta: string;
	export let description: string;
	export let url: string;
	export let type: string;
	export let podcastId: string;
</script>

<section class="mt-12 ">
	<h2 class="leading-tight text-3xl md:text-4xl mb-3 dark:text-white text-ebony-clay-600">
		Featured
	</h2>
	<div
		class="relative flex items-center justify-center bg-white text-white overflow-hidden rounded-lg shadow-md dark:bg-gray-800 focus:outline-none transition hover:ring-2 ring-yellow-50 ring-offset-2 backdrop-filter"
	>
		<div class="relative z-10 px-5 sm:text-left text-center py-10">
			<div
				class="space-y-5 mx-auto flex items-center justify-center max-w-screen-xl w-full sm:mb-4 md:my-12 lg:m-0 mt-0 mb-15"
			>
				<div
					class="flex lg:flex-row flex-col items-center justify-center sm:space-x-10 sm:space-y-0 space-y-5 0 w-full xl:pr-16"
				>
					{#if type !== 'podcast'}
						<div class="col-span-1 max-w-sm">
							<a href={url}>
								<img
									alt="Featured illustration"
									src={image}
									decoding="async"
									class="object-center object-contain rounded-lg w-64"
								/>
							</a>
						</div>
					{/if}
					<div class="flex flex-col col-span-2 lg:items-start items-center w-full">
						<a href={url}
							><h1
								class="lg:text-3xl md:text-2xl text-xl text-left font-extrabold dark:text-white text-gray-800 leading-tight"
							>
								{title}
							</h1>
						</a>
						{#if meta}
							<p class="my-4 font-medium opacity-75 font-body text-left w-full">
								{meta}
							</p>
						{/if}

						{#if type === 'podcast'}
							<div class="w-full font-body">
								<Buzzsprout buzzsproutId={`1081172/${podcastId}`} />
							</div>
						{:else if description}
							<div
								class="max-w-screen-md font-body text-ebony-clay-800 dark:text-gray-50 text-left md:text-center"
							>
								<p>
									{description}
								</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
