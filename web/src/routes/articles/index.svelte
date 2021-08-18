<script lang="ts" context="module">
	export const prerender = true;
	export async function load({ fetch }) {
		const url = '/api/articles.json';
		const res = await fetch(url);
		if (res.ok) {
			const articles = await res.json();
			return {
				props: {
					articles
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script>

<script lang="ts">
	import Featured from '$components/Featured.svelte';
	import ContentCard from '$components/ContentCard.svelte';
	import type { ContentElement } from 'src/types';
	export let articles: ContentElement[];
</script>

<Featured
	image="https://res.cloudinary.com/escuela-frontend/image/upload/v1625855100/ogimages/ogimage-las-diferencias-entre-componentes-controlados-y-no-controlados_pv6wdj.png"
	title="Las Diferencias Entre Componentes Controlados y No-Controlados en React"
	meta="Escuela Frontend"
	description="React define dos tipos de componentes: Controlados y No-Controlados. En este artículo revisaremos las diferencias entre estas dos categorías. ¿Cuando usar cada uno de ellos?"
	url="https://escuelafrontend.com/articulos/las-diferencias-entre-componentes-controlados-y-no-controlados-en-react"
/>

<section class="mt-12">
	<h2 class="leading-tight text-2xl md:text-3xl my-12 dark:text-white">Guest Writing</h2>
	<div class="grid md:grid-cols-2 grid-cols-1 md:gap-16 gap-8">
		{#each articles as content}
			<ContentCard {content} />
		{/each}
	</div>
</section>
