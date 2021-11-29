<script lang="ts" context="module">
	import type { Course } from '$lib/types';
	export async function load({ fetch }) {
		try {
			const response = await fetch('/api/courses.json');
			const json = await response.json();
			return {
				props: {
					courses: json.courses
				}
			};
		} catch (e) {
			return {
				status: 500,
				message: e.message,
				error: new Error(`Could not load courses`)
			};
		}
	}
</script>

<script lang="ts">
	import Featured from '$components/Featured.svelte';
	import Seo from '$components/Seo.svelte';
	export let courses: Course[];
	const featured = courses.find((item) => item.id === 404918);

	let searchItem: string;

	$: filteredCourse = searchItem
		? courses.filter((item: Course) => {
				const title = item.title?.toLowerCase() ?? '';
				return title.includes(searchItem.toLowerCase());
		  })
		: courses;
</script>

<Seo
	title="Matias Hernández | Courses"
	keywords={['Courses', 'Javascript', 'Tutorials', 'Instructor', 'React', 'egghead.io']}
/>

<Featured
	image={featured.image}
	title={featured.title}
	meta={featured.access_state}
	url={featured.url}
/>
<div class="flex flex-row mt-12">
	<input
		type="text"
		name="firstName"
		autocomplete="name"
		placeholder="Search"
		aria-label="Search"
		class="border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-6 w-full dark:text-white bg-transparent border rounded-lg focus:outline-none"
		bind:value={searchItem}
	/>
</div>
<section class="mt-24">
	<h2 class="leading-tight text-3xl md:text-4xl mb-3 dark:text-white text-ebony-clay-800s">
		Courses
	</h2>
	<div class="grid md:grid-cols-3 grid-cols-1 md:gap-16 gap-20">
		{#each filteredCourse as item}
			<div class="group peer flex flex-col ">
				<div class="md:mb-4 mb-2 ">
					<a class="relative block w-full focus:outline-none " href={item.url}
						><div
							class="aspect-w-2 aspect-h-1 w-full rounded-lg focus:ring transition group-hover:ring-2 ring-yellow-50 ring-offset-2"
						>
							<img
								alt={item.title}
								class="rounded-lg object-cover"
								src={`${item.image}`}
								loading="lazy"
								width="220"
							/>
						</div>

						<div
							class="mt-8 dark:text-gray-300 text-ebony-clay-800 text-md font-medium capitalize text-body"
						>
							{item.access_state}
						</div>
						<div class="text-2xl font-medium md:text-3xl text-black dark:text-white mt-4">
							{item.title}
						</div></a
					>
				</div>
			</div>
		{/each}
	</div>
</section>
