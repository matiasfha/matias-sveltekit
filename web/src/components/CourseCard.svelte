<script lang="ts">
	import { enhance } from '$app/forms';

	export let logo: string;
	export let title: string;
	export let description: string;
	export let formId: string;
	export let tags: string[];

	$: success = false

	function useEnhance({ form, data }) {
		return async ({ result, update }) => {
			if(result.type === 'success') {
				success = true
			}
		};
	}
</script>

<div class="relative pt-12 w-full h-full">
	<img
		class="w-auto h-24 object-contain absolute left-4 top-10 z-10"
		alt="Illustration of a course Logo"
		src={logo}
	/>

	<div
		class="px-4 py-12 md:p-12 mt-14 md:mt-12 relative flex items-center justify-center bg-white dark:text-white  text-ebony-clay-800 overflow-hidden rounded-lg shadow-sm dark:bg-gray-800 focus:outline-none transition hover:ring-2 ring-yellow-50 ring-offset-2"
	>
		<div class="flex flex-col lg:items-start items-start md:items-center w-full">
			<h2
				class="lg:text-3xl md:text-2xl text-xl font-extrabold dark:text-white text-gray-800 leading-tight text-left"
			>
				{title}
			</h2>

			<div
				class="max-w-screen-md font-body text-left pt-8 prose dark:text-gray-300 text-ebony-clay-800"
			>
				{@html description}
			</div>
			{#if success}
			<p>Gracias por unirte. Revisa tu correo para confirmar</p>
			{:else}
			<form
				class="w-full flex flex-col md:flex-row mt-12 gap-4 md:gap-16"
				method="POST"
				action="/newsletter"
				use:enhance={useEnhance}
			>
				<input
					name="email"
					type="text"
					placeholder="Tu email"
					class="shadow-md border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-2 h-14 w-full dark:text-gray-300 bg-gray-50 border rounded-lg focus:outline-none"
				/>
				<input type="hidden" name="sequenceId" value={formId} />
				<input type="hidden" name="tags" value={tags} />

				<button
					class={`w-full h-14 
						bg-ebony-clay-600 
						dark:bg-gray-200 
						border-ebony-clay-600 
						dark:border-gray-200 
						text-gray-300 dark:text-ebony-clay-600
						relative inline-flex items-center justify-center p-4 px-8 py-3 overflow-hidden font-medium
						transition duration-300 ease-out border-2 
						rounded-full shadow-md group`}
				>
					<span
						class={`absolute inset-0 flex items-center justify-center w-full h-full
							  duration-300 -translate-x-full
							   group-hover:translate-x-0 ease
							   dark:text-white text-ebony-clay-600
							  dark:bg-ebony-clay-600 bg-gray-200`}
					>
						<svg
							class="w-8 h-6"
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
						class={`absolute flex items-center justify-center w-full h-full
         text-gray-100 dark:text-ebony-clay-600  
         transition-all duration-300 transform group-hover:translate-x-full ease`}>Únete hoy</span
					>
					<span class="relative invisible">Únete hoy</span>
				</button>
			</form>
			{/if}
		</div>
	</div>
</div>
