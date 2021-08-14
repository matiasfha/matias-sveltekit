<script context="module" lang="ts">
	export async function load({ fetch }) {
		try {
			const url = '/api/latest.json';
			const res = await fetch(url);
			const favorites = await fetch('/api/favorites.json');

			if (res.ok && favorites.ok) {
				const latest = await res.json();
				const favoritesData = await favorites.json();
				return {
					props: {
						latest,
						favorites: favoritesData
					}
				};
			}

			return {
				status: res.status,
				error: new Error(`Could not load ${url}`)
			};
		} catch (e) {
			console.error(e);
			return {
				status: 500,
				error: new Error(e.message)
			};
		}
	}
</script>

<script lang="ts">
	import type { Favorite, Latest } from 'src/types';

	import Hero from '$components/Hero.svelte';
	import Featured from '$components/Featured.svelte';
	import LatestSection from '$components/Latest.svelte';
	import microbytes from '$images/microbytes.png';

	export let latest: Latest[];
	export let favorites: Favorite[];
</script>

<Hero />

<Featured
	image="https://storage.buzzsprout.com/variants/xdwqi3lrt55higf78atbhwp8w8of/8d66eb17bb7d02ca4856ab443a78f2148cafbb129f58a3c81282007c6fe24ff2.jpg"
	title="Jelly Drops, Design and Testing with Colby Fayock"
	meta="3rd Season Episode 3"
	description=""
	url="https://www.cafecon.tech/1081172/8996360-jelly-drops-design-and-testing-with-colby-fayock"
	type="podcast"
	podcastId="8996360"
/>

<!-- Latest -->
<LatestSection {latest} />
<!-- Favorites-->
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

<section class="mt-24">
	<div
		class="relative flex items-center justify-center bg-white dark:text-white  text-ebony-clay-800 overflow-hidden rounded-lg shadow-sm dark:bg-gray-800 focus:outline-none transition hover:ring-2 ring-yellow-50 ring-offset-2"
	>
		<div class="relative z-10 px-5 sm:text-left text-center py-10">
			<div
				class="space-y-5 mx-auto flex flex-col items-center justify-center max-w-screen-xl lg:px-8 w-full sm:mb-4 md:my-12 lg:m-0 mt-0 mb-15"
			>
				<div
					class="flex lg:flex-row flex-col items-center justify-center sm:space-x-10 sm:space-y-0 space-y-5 0 w-full xl:pr-16"
				>
					<div class="flex-shrink-0">
						<img
							alt="illustration for React Desde Cero"
							src={microbytes}
							decoding="async"
							class="object-contain"
						/>
					</div>
					<div class="flex flex-col lg:items-start items-center w-full">
						<h3
							class="text-lg md:text-sm text-green-600 dark:text-green-300 uppercase font-semibold mb-2 font-body text-left md"
						>
							Microcursos en tu inbox!
						</h3>
						<h1
							class="lg:text-5xl md:text-4xl sm:text-3xl text-2xl font-extrabold dark:text-white text-gray-800 leading-tight text-left"
						>
							¿Aún luchas con Javascript y el desarrollo web?
						</h1>

						<div class="max-w-screen-md font-body text-left pt-8">
							<p>
								​Unete a Micro Bytes un newsletter semanal de micro cursos. Recibirás una colección
								de contenidos para mejorar tu conocimiento en desarrollo web y darle un giro a tu
								carrera, directamente en tu correo.
							</p>
						</div>
					</div>
				</div>
				<div class="relative w-full">
					<form
						method="post"
						action="/TODO: set up action for newsletter"
						enctype="application/x-www-form-urlencoded"
						class="mt-8 md:space-y-12 w-full grid grid-row md:grid-cols-2 gap-4"
					>
						<div class="flex flex-col gap-4">
							<input
								type="text"
								name="firstName"
								autocomplete="name"
								placeholder="First name"
								aria-label="First name"
								class="border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-6 w-full dark:text-white bg-transparent border rounded-lg focus:outline-none"
							/>
							<input
								type="email"
								name="email"
								autocomplete="email"
								placeholder="email"
								aria-label="email"
								class="border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-6 w-full dark:text-white bg-transparent border rounded-lg focus:outline-none"
								value=""
							/>
						</div>
						<button
							type="submit"
							class="w-full md:max-h-12 dark:bg-gray-200 bg-ebony-clay-600 relative inline-flex items-center justify-center p-4 px-6 py-8 overflow-hidden font-medium text-gray-300 dark:text-ebony-clay-600 transition duration-300 ease-out border-2 border-ebony-clay-600 dark:border-gray-200 rounded-full shadow-md group"
						>
							<span
								class="absolute inset-0 flex items-center justify-center w-full h-full dark:text-white text-ebony-clay-600 duration-300 -translate-x-full dark:bg-ebony-clay-600 bg-gray-200 group-hover:translate-x-0 ease"
							>
								<svg
									class="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M14 5l7 7m0 0l-7 7m7-7H3"
									/></svg
								>
							</span>
							<span
								class="absolute flex items-center justify-center w-full h-full text-gray-100 dark:text-ebony-clay-600 transition-all duration-300 transform group-hover:translate-x-full ease"
								>Quiero unirme</span
							>
							<span class="relative invisible">Quiero unirme</span>
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
</section>
