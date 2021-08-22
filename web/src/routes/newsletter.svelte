<script context="module">
	export async function load({ fetch }) {
		const url = '/api/newsletter.json';
		const res = await fetch(url);
		if (res.ok) {
			const courses = await res.json();

			return {
				props: {
					courses
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
	import Seo from '$components/Seo.svelte';
	import CourseCard from '$components/CourseCard.svelte';
	import microbytes from '$images/microbytes.png';
	import blocksToHtml from '@sanity/block-content-to-html';
	export let courses = [];
</script>

<Seo title="Matias Hernández | MicroBytes newsletter" keywords={['newsletter', 'microbytes']} />

<section class="mt-24">
	<img
		alt="illustration for React Desde Cero"
		src={microbytes}
		decoding="async"
		class="object-contain mx-auto"
	/>
	<div
		class="p-2 md:p-12 relative flex flex-col items-center justify-center dark:text-white  text-ebony-clay-800 overflow-hidden rounded-lg shadow-sm focus:outline-none transition hover:ring-2 ring-yellow-50 ring-offset-2"
	>
		<h1
			class="lg:text-5xl md:text-4xl sm:text-3xl text-2xl font-extrabold dark:text-white text-gray-800 leading-tight text-center"
		>
			¿Aún luchas con Javascript y el desarrollo web?
		</h1>

		<div class="font-body text-left pt-8">
			<p>
				​Unete a Micro Bytes un newsletter semanal de micro cursos. Recibirás una colección de
				contenidos para mejorar tu conocimiento en desarrollo web y darle un giro a tu carrera,
				directamente en tu correo.
			</p>
		</div>

		<form
			action={`https://app.convertkit.com/forms/1951742/subscriptions`}
			method="post"
			class="w-full flex flex-col md:flex-row mt-12 gap-4 md:gap-16"
		>
			<input
				name="email_address"
				placeholder="Tu email"
				required
				type="email"
				class="border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-4
					w-full dark:text-white bg-transparent border rounded-lg focus:outline-none"
			/>
			<button
				class={`w-full h-14 
        bg-ebony-clay-600 
        dark:bg-gray-200 
        border-ebony-clay-600 
        dark:border-gray-200 
        text-gray-300 dark:text-ebony-clay-600
        relative inline-flex items-center justify-center p-4 px-8s py-3 overflow-hidden font-medium
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
         transition-all duration-300 transform group-hover:translate-x-full ease`}>Suscribete</span
				>
				<span class="relative invisible">Suscribete</span>
			</button>
		</form>
	</div>
</section>

<h2
	class="lg:text-3xl md:text-2xl sm:text-xl text-lg font-extrabold dark:text-white text-gray-800 leading-tight text-left py-12"
>
	Listado de Cursos
</h2>

<div class="grid grid-cols-1 gap-2">
	{#each courses as course}
		<CourseCard
			logo={course.image.asset.url}
			title={course.course}
			description={blocksToHtml({
				blocks: course.descriptionRaw,
				projectId: 'cyypawp1',
				dataset: 'production'
			})}
			convertKitId={course.tagId}
		/>
	{/each}
</div>
