<script lang="ts">
	import '../app.css';
	import Footer from '$components/Footer.svelte';
	import NavBar from '$components/NavBar.svelte';
	import { onMount } from 'svelte';
	import { partytownSnippet } from '@builder.io/partytown/integration';
	import { applyAction, enhance } from '$app/forms';
	// Add the Partytown script to the DOM head
	let scriptEl;

	onMount(() => {
		if (scriptEl) {
			scriptEl.textContent = partytownSnippet();
		}
	});
	let dialog;

	let showKbar = false;
	function handleWindowKeyDown(event: KeyboardEvent) {
		if (event.ctrlKey && event.key === 'k') {
			event.preventDefault();
			showKbar = !showKbar;
		}
	}

	function handleWindowClick(event: MouseEvent) {
		if (showKbar && dialog && !dialog.contains(event.target) && dialog !== event.target) {
			event.stopPropagation();
			showKbar = false;
		}
	}

	let isLoading = false;
	let answer: string | null = null;
	function onSubmit({ form, data }) {
		isLoading = true;
		return async ({ result }) => {
			if (result.type === 'success') {
				answer = result.data.response;
			}
			isLoading = false;
			applyAction(result);
		};
	}
</script>

<svelte:head>
	<!-- Config options -->
	<script>
		// Forward the necessary functions to the web worker layer
		partytown = {
			forward: ['dataLayer.push'],
			resolveUrl: function (url, location, type) {
				if (url.hostname.includes('buymeacoffee.com')) {
					return new URL('https://matiashernandez.dev/buymeacoffee');
				}
				if (url.hostname.includes('convertkit.com')) {
					return new URL('https://matiashernandez.dev/convertkit');
				}
				return url;
			}
		};
	</script>

	<!-- `partytownSnippet` is inserted here -->
	<script bind:this={scriptEl}></script>
</svelte:head>

<svelte:window on:keydown={handleWindowKeyDown} on:click={handleWindowClick} />
{#if showKbar}
	<dialog
		id="search"
		open={showKbar}
		class="w-full max-w-2xl absolute top-1/3 z-20 bg-gray-100 text-ebony-clay-600 rounded-xl shadow-md flex flex-col px-4 py-5"
		bind:this={dialog}
	>
		<form
			method="POST"
			action="/?/search"
			use:enhance={onSubmit}
			class="flex flex-col w-full overflow-auto"
		>
			<div
				class="w-full flex flex-row items-center justify-start gap-2 py-2 border-b border-gray-500 border-opacity-20"
			>
				<span class="p-0 m-0 text-sm sm:text-base">🤖</span>
				<p class="text-gray-700 text-sm prose">Hi, how can I help you?</p>
			</div>
			<div
				class="w-full flex flex-row items-center justify-start gap-2 py-2 border-b border-gray-500 border-opacity-20"
			>
				<input
					name="question"
					type="text"
					autocomplete="off"
					spellcheck="false"
					placeholder="Hi, how can I help you?"
					class="px-4 py-3 text-md w-100 bg-gray-100 text-ebony-clay-600 w-full"
				/>
				<span class="p-0 m-0 text-sm sm:text-base">😃 </span>
			</div>
			{#if isLoading}<p>Pensando...</p>{/if}
			{#if answer!=null}
				<div
					class="w-full flex flex-row items-center justify-start gap-2 py-2 border-b border-gray-500 border-opacity-20"
				>
					<span class="p-0 m-0 text-sm sm:text-base">🤖</span>
					<p class="text-gray-700 text-sm prose">
						{answer}
					</p>
				</div>
			{/if}
			<p class="text-xs text-gray-400 pt-2">Powered by OpenAI and Langchain</p>
		</form>
	</dialog>
{/if}
<NavBar />

<main class="mx-auto max-w-7xl px-4 md:px-8">
	<slot />
</main>

<Footer />
