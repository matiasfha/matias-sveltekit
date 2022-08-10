<script lang="ts">
	import { t } from '$lib/translations';
	export let image: string;
	export let title: string;
	export let meta: string;
	export let description: string;
	export let url: string;
	export let type: string = "post";
</script>

<section class="mt-12 ">
	<h2
		class="leading-tight sm:font-semibold font-bold text-3xl md:text-4xl mb-3 dark:text-white text-ebony-clay-600"
	>
		{$t('common.featured')}
	</h2>
	<div
		class="relative flex items-center justify-center bg-white text-white overflow-hidden rounded-lg shadow-md dark:bg-gray-800 focus:outline-none transition hover:ring-2 dark:ring-yellow-50 ring-green-400 ring-offset-2 backdrop-filter"
	>
		<div class="relative z-10 px-5 sm:text-left text-center py-10">
			<div
				class="space-y-5 mx-auto flex items-center justify-center md:max-w-screen-xl w-full sm:mb-4 md:my-12 lg:m-0 mt-0 mb-15"
			>
				<div
					class="flex lg:flex-row flex-col items-center justify-center sm:space-x-10 sm:space-y-0 space-y-5 0 w-full xl:pr-16"
				>
					{#if type !== 'podcast'}
						<div class="col-span-1 max-w-sm w-[24rem]">
							<a
								sveltekit:prefetch
								class="group peer relative block w-full focus:outline-none"
								href={url}
								><div
									class="aspect-w-2 aspect-h-1 h-1/4 rounded-lg transition "
								>
									<img alt={title} class="rounded-lg object-cover" src={image} height="173" />
								</div>
								</a>
						</div>
					{/if}
					<div class="flex flex-col col-span-2 lg:items-start items-center w-full px-6 md:px-0">
						<a href={url}
							><h3
								class="lg:text-3xl md:text-2xl text-xl text-left font-extrabold dark:text-white text-gray-800 leading-tight"
							>
								{title}
							</h3>
						</a>
						{#if meta}
							<p
								class="my-4 font-medium opacity-75 font-body self-start capitalize text-ebony-clay-800 py-1 px-2 rounded bg-green-400 inline-block w-[max-content]"
							>
								{meta}
							</p>
						{/if}

						{#if type === 'podcast'}
							<div class="w-full font-body">
								<iframe src="https://anchor.fm/cafecontech/embed/episodes/Testing--React--Typescript-and-Remix-with-Kent-C--Dodds-e1k9unm/a-a85b5vd" height="160px" width="100%" frameborder="0" scrolling="no" title="Podcast Player"></iframe>
							</div>
						{:else if description}
							<div
								class="max-w-screen-md font-body text-ebony-clay-800 dark:text-gray-50 text-left"
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
