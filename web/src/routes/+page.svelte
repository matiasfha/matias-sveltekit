<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	$: ({ latest, favorites, featured } = data);

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
	image={featured.image}
	title={featured.title}
	meta="Free"
	description={featured.description}
	url={featured.url}
	type="course"
/>
<LatestSection {latest} />

<FavoritesSection {favorites} />

<!-- <Microbytes /> -->
