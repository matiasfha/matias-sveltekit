<script lang="ts" context="module">
	export const prerender = true;
	export async function load({ fetch }) {
		const url = '/api/blog.json';
		const res = await fetch(url);
		if (res.ok) {
			const posts = await res.json();
			return {
				props: {
					posts
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
	type Post = {
		date: string;
		banner: string;
		keywords: string[];
		title: string;
		description: string;
		tag: 'Post' | 'Seed';
		slug: string;
	};
	export let posts: Post[];
</script>

<Featured
	image="https://res.cloudinary.com/matiasfha/image/upload/v1604323837/monirul-islam-shakil-31I2Mi1UuxQ-unsplash_kkerl8.jpg"
	title="React useEffect ¿Por que el arreglo de dependencias es importante?"
	meta="Workshop · Sábado 7 de Agosto, 2021"
	description="En este workshop, aprenderás los fundamentos esenciales para empezar tu carrera
								profesional como un React developer. Cuando hayas terminado, tendrás los fundamentos
								esenciales para crear experiencias excelentes para los usuarios de tus aplicaciones."
/>

<section class="mt-12">
	<h2 class="leading-tight text-2xl md:text-3xl my-12 dark:text-white">Blog Posts</h2>
	<div class="grid md:grid-cols-2 grid-cols-1 md:gap-16 gap-8">
		{#each posts as post}
			<div class="flex flex-col">
				<div class="md:mb-4 mb-2">
					<a
						class="group peer relative block w-full focus:outline-none"
						href={`/blog/post/${post.slug}`}
						><div
							class="aspect-w-2 aspect-h-1 h-1/4 rounded-lg transition group-hover:ring-2 dark:ring-yellow-50 ring-green-400 ring-offset-2"
						>
							<img
								alt="podcast"
								class="rounded-lg object-cover"
								src={post.banner}
								decoding="async"
							/>
						</div>

						<div
							class="mt-8 dark:text-gray-300 text-gray-500 text-md font-medium lowercase text-body"
						>
							{new Date(post.date).toLocaleDateString()}
						</div>
						<h2 class="md:text-2xl text-xl font-bold leading-tighter text-black dark:text-white ">
							{post.title}
						</h2></a
					>
				</div>
			</div>
		{/each}
	</div>
</section>
