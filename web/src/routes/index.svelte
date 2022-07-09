<script context="module" lang="ts">
	export async function load({ fetch, context }) {
		try {
			const url = '/api/latest.json';
			const res = await fetch(url);
			const favorites = await fetch('/api/favorites.json');

			if (res.ok && favorites.ok) {
				const latest: Latest[] = await res.json();
				const favoritesData: ContentElement[] = await favorites.json();
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
	export const prerender = true;
</script>

<script lang="ts">
	import type { ContentElement, Latest } from '$lib/types';
	import Seo from '$components/Seo.svelte';
	import Hero from '$components/Hero.svelte';
	import Featured from '$components/Featured.svelte';
	import LatestSection from '$components/Latest.svelte';
	import FavoritesSection from '$components/Favorites.svelte';
	export let latest: Latest[];
	export let favorites: ContentElement[];
</script>

<!--INFOLINKS_OFF-->
<Seo
	title="Matias Hernández Website"
	keywords={[
		'React',
		'Javascript',
		'Svelte',
		'SvelteKit',
		'Typescript',
		'Mentoría',
		'Aprende React',
		'Learn React',
		'React Workshops',
		'React Training',
		'Learn JavaScript',
		'Learn TypeScript',
		'Consultoría',
		'hooks react',
		'useeffect',
		'hook react',
		'react tutorial'
	]}
	description="Personal site of Matias Hernandez, dev, instructor and podcaster. Helping devs to level up their careers as software Developers"
/>

<Hero />

<Featured
	image="https://cdn.sanity.io/images/cyypawp1/production/f323a942fbbe094bf68303cf3855ff111c067709-1400x1400.png"
	title="Testing, React, Typescript and Remix with Kent C. Dodds"
	meta="3rd Season Episode 01"
	description=""
	url="https://www.cafecon.tech/1081172/8869619-testing-react-typescript-and-remix-with-kent-c-dodds"
	type="podcast"
	podcastId="8869619"
/>

<LatestSection {latest} />

<FavoritesSection {favorites} />

<!-- <Microbytes /> -->
