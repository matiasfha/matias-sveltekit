<script lang="ts">
	import { browser } from '$app/environment';
	import { GenericEmbed } from 'sveltekit-embed';
	export let title = '';
	export let id = '';
	export let view: 'editor' | 'preview' | 'default' = 'default';
	export let clickToLoad = true; //ctl
	export let hideNavigation = true;
	export let hideExplorer = false;
	export let theme: string | 'light' | 'dark' | 'default' = 'dark';
	export let file: string | undefined;

	let baseUrl = `https://stackblitz.com/edit/${id}?embed=1`;
	const config = {
		ctl: `${clickToLoad ? 1 : 0}`,
		hideExplorer: `${hideExplorer ? 1 : 0}`,
		hideNavigation: `${hideNavigation ? 1 : 0}`,
		theme
	};
	if (view !== 'default') {
		config['view'] = view;
	}
	if (file) {
		config['file'] = file;
	}
	const queryString = new URLSearchParams(config);
	const src = `${baseUrl}&${queryString.toString()}`;
</script>

{#if browser}
	<GenericEmbed {src} {title} {id} />
{:else}
	<div />
{/if}
