<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	$: ({ latest, favorites, featured, lang } = data);

	import Seo from '$components/Seo.svelte';
	import Hero from '$components/Hero.svelte';
	import Featured from '$components/Featured.svelte';
	import LatestSection from '$components/Latest.svelte';
	import FavoritesSection from '$components/Favorites.svelte';
	import { CldImage } from 'svelte-cloudinary';
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

{#if lang === 'es'}
	<section class="mt-12">
		<h2
			class="leading-tight sm:font-semibold font-bold text-3xl md:text-4xl mb-3 dark:text-white text-ebony-clay-600 pb-8"
		>
			Nuevos Cursos!
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<div
				class="relative flex items-center justify-center bg-white text-white overflow-hidden rounded-lg shadow-md dark:bg-[#12182A] focus:outline-none transition hover:ring-2 dark:ring-yellow-50 ring-green-400 ring-offset-2 backdrop-filter p-8"
			>
				<div
					class="space-y-5 mx-auto flex items-center justify-center md:max-w-screen-xl w-full sm:mb-4 md:my-12 lg:m-0 mt-0 mb-15"
				>
					<div
						class="flex lg:flex-row flex-col items-center justify-center sm:space-x-10 sm:space-y-0 space-y-5 0 w-full xl:pr-16"
					>
						<div class="flex flex-col col-span-2 lg:items-start items-center w-full px-6 md:px-0">
							<a
								class="group peer relative block w-full focus:outline-none"
								href="https://tsfundamentals.com"
								><div class="aspect-w-2 aspect-h-1 h-1/4 rounded-lg transition">
									<CldImage
										src="Screenshot_2023-04-29_at_17.56.08_tskx3o.png"
										alt="Fundamentos de Typescript"
										height={220}
										layout="fullWidth"
									/>
								</div>
							</a>
							<a href="https://tsfundamentals.com"
								><h3
									class="lg:text-3xl md:text-2xl text-xl text-left font-extrabold dark:text-white text-gray-800 leading-tight py-8"
								>
									Fundamentos de Typescript
								</h3>
							</a>

							<div
								class="max-w-screen-md text-md font-body text-ebony-clay-800 dark:text-gray-50 text-left leading-relaxed"
							>
								<p>
									Aprende los fundamentos de Typescript y mejora la calidad de tus desarrollos.
									Descubre cómo utilizar el tipado de variables para ahorrar tiempo en la detección
									de errores, cómo prevenir errores en tiempo de ejecución y cómo mejorar la
									escalabilidad y legibilidad del código. Este curso es ideal para desarrolladores
									frontend y backend, estudiantes y programadores en busca de mejorar sus
									habilidades en el desarrollo de software. ¡Inscríbete hoy y obtén una ventaja
									competitiva en el mercado laboral!
								</p>
							</div>
							<a
								href="https://tsfundamentals.com"
								class="my-4 font-medium opacity-75 font-body self-end capitalize text-ebony-clay-800 py-1 px-2 rounded bg-green-400 inline-block w-[max-content] px-8"
							>
								Suscribete aqui
							</a>
						</div>
					</div>
				</div>
			</div>
			<div
				class="relative flex items-center justify-center bg-white text-white overflow-hidden rounded-lg shadow-md dark:bg-[#12182A] focus:outline-none transition hover:ring-2 dark:ring-yellow-50 ring-green-400 ring-offset-2 backdrop-filter p-8"
			>
				<div
					class="space-y-5 mx-auto flex items-center justify-center md:max-w-screen-xl w-full sm:mb-4 md:my-12 lg:m-0 mt-0 mb-15"
				>
					<div
						class="flex lg:flex-row flex-col items-center justify-center sm:space-x-10 sm:space-y-0 space-y-5 0 w-full xl:pr-16"
					>
						<div class="flex flex-col col-span-2 lg:items-start items-center w-full px-6 md:px-0">
							<a
								class="group peer relative block w-full focus:outline-none"
								href="https://tsfundamentals.com"
								><div class="aspect-w-2 aspect-h-1 h-1/4 rounded-lg transition">
									<CldImage
										src="Screenshot_2023-05-01_at_11.03.06_j6xfjb"
										alt="Fundamentos de Typescript"
										height={220}
										layout="fullWidth"
									/>
								</div>
							</a>
							<a href="https://javascriptparareact.com"
								><h3
									class="lg:text-3xl md:text-2xl text-xl text-left font-extrabold dark:text-white text-gray-800 leading-tight py-8"
								>
									Javascript para React
								</h3>
							</a>

							<div
								class="max-w-screen-md text-md font-body text-ebony-clay-800 dark:text-gray-50 text-left leading-relaxed"
							>
								<p>
									Javascript para React es un micro curso que te ayudará a enfocarte en lo esencial
									del lenguaje de programación para una mejor comprensión y eficacia en el
									desarrollo de aplicaciones web con React. Aprende sobre closures, template
									literals, destructuring, métodos de arreglos, promesas y más en este breve pero
									completo curso a través de una serie de emails periódicos. Descubre cómo
									fortalecer tus conocimientos de Javascript para aprovechar al máximo React.
									¡Suscríbete ahora!
								</p>
							</div>
							<a
								href="https://javascriptparareact.com"
								class="my-4 font-medium opacity-75 font-body self-end capitalize text-ebony-clay-800 py-1 px-2 rounded bg-green-400 inline-block w-[max-content] px-8"
							>
								Suscribete aqui
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
{/if}

{#if lang === 'en'}
	<Featured
		image={featured.image}
		title={featured.title}
		meta="Free"
		description={featured.description}
		url={featured.url}
		type="course"
	/>
{/if}
<LatestSection {latest} />

<FavoritesSection {favorites} />

<!-- <Microbytes /> -->
