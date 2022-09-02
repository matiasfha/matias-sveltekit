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
<!-- 
<Featured
	image="https://cdn.sanity.io/images/cyypawp1/production/f323a942fbbe094bf68303cf3855ff111c067709-1400x1400.png"
	title="Testing, React, Typescript and Remix with Kent C. Dodds"
	meta="3rd Season Episode 01"
	description=""
	url="https://anchor.fm/cafecontech/episodes/Testing--React--Typescript-and-Remix-with-Kent-C--Dodds-e1k9unm/a-a85b5vd"
	type="podcast"
/> -->
<Featured
	image="https://res.cloudinary.com/dg3gyk0gu/image/upload/v1661961863/course-resources/full-stack-web3-and-blockchain-development-on-ethereum-with-sveltekit/og-banner.png"
	title="Full Stack Web3 and Blockchain Development on Ethereum with SvelteKit"
	meta="Pro: Curso en Egghead"
	description="description={`
		<p>Web3 is a paradigm shift in how applications are interacted with, ran, and built.</p>
	
	
		<p>While you build this application you will learn how to:</p>
		<ul class="list-disc list-inside">
			<li>Write a smart contract using Solidity language.</li>
			<li>Test the smart contract using just JavaScript through the waffle framework.</li>
			<li>Communicate and interact with the smart contract using ethers.js in a SvelteKit application.</li>
			<li>Deploy your smart contract to make it public and accessible to anyone.</li>
		</ul>
		`}"
	url="https://egghead.io/playlists/full-stack-web3-and-blockchain-development-on-ethereum-with-sveltekit-f522ceec??af=4cexzz"
	type="course"
/>
<LatestSection {latest} />

<FavoritesSection {favorites} />

<!-- <Microbytes /> -->
