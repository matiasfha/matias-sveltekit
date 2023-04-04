<script lang="ts">
	// Suggestion (check code before using, and possibly convert to data.X access later):
	import type { PageData } from './$types';
	export let data: PageData;
	$: ({ courses } = data);

	import Seo from '$components/Seo.svelte';
	import CourseCard from '$components/CourseCard.svelte';
	import microbytes from '$images/microbytes.png';

</script>

<Seo
	title="MicroBytes newsletter"
	keywords={['newsletter', 'microbytes']}
	description="Newsletter de micro-cursos"
	canonical="https://matiashernandez.dev/newsletter"
/>
<!--INFOLINKS_OFF-->
<section class="mt-24">
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
				Únete a la comunidad de mas de **500 desarrolladores** como tu que son parte del newsletter.
				
			<br />
				El newsletter consiste principalmente en micro-cursosi periodicos, gratuitos y directo en tu bandeja de entrada. 
				Además de recibir algunos comentarios o articulos escritos por mi sobre temas desarrollo web y más.

			</p>
		</div>
	</div>
</section>

<h2
	class="lg:text-3xl md:text-2xl sm:text-xl text-lg font-extrabold dark:text-white text-gray-800 leading-tight text-left py-12"
>
	Curso actual
</h2>

<div class="grid grid-cols-1 gap-2">
	{#each courses as course}
		<CourseCard
			logo={course.image}
			title={course.course}
			description={course.description}
			formId={course.tagId}
		/>
	{/each}
</div>
