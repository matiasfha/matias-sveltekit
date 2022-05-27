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
	import Articles from './articles.svelte';
	export let courses = [];
</script>

<Seo
	title="Matias Hernández | MicroBytes newsletter"
	keywords={['newsletter', 'microbytes']}
	description="Newsletter de micro-cursos"
/>

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
				Únete a Micro Bytes un newsletter semanal de micro cursos. Recibirás una colección de
				contenidos para mejorar tu conocimiento en desarrollo web y darle un giro a tu carrera,
				directamente en tu correo.
			</p>
		</div>
	</div>
</section>

<h2
	class="lg:text-3xl md:text-2xl sm:text-xl text-lg font-extrabold dark:text-white text-gray-800 leading-tight text-left py-12"
>
	Listado de Cursos
</h2>

<div class="grid grid-cols-1 gap-2">
	<CourseCard
		logo={courses[1].image.asset.url}
		title={courses[1].course}
		description={blocksToHtml({
			blocks: courses[1].descriptionRaw,
			projectId: 'cyypawp1',
			dataset: 'production'
		})}
		formId={'4616584'}
		codeId={'g5i0m4'}
	/>
	<CourseCard
		logo={courses[0].image.asset.url}
		title={courses[0].course}
		description={blocksToHtml({
			blocks: courses[0].descriptionRaw,
			projectId: 'cyypawp1',
			dataset: 'production'
		})}
		formId={'5395967'}
		codeId={'u2d6y6'}
	/>
</div>
<!--
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
-->
