<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	$: ({ latest, favorites } = data);

	import Seo from '$components/Seo.svelte';
	import Hero from '$components/Hero.svelte';
	import Featured from '$components/Featured.svelte';
	import LatestSection from '$components/Latest.svelte';
	import FavoritesSection from '$components/Favorites.svelte';
	
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
	url="https://anchor.fm/cafecontech/episodes/Testing--React--Typescript-and-Remix-with-Kent-C--Dodds-e1k9unm/a-a85b5vd"
	type="podcast"
/>

<LatestSection {latest} />

<FavoritesSection {favorites} />

<!-- <Microbytes /> -->
