<script lang="ts">
	import type { Post } from '$lib/types';
	export let post: Post;
</script>

<div class="flex flex-col">
	<div class="md:mb-4 mb-2">
		<a
			sveltekit:prefetch
			class="group peer relative block w-full focus:outline-none"
			href={`/blog/post/${post.slug}`}
			><div
				class="aspect-w-2 aspect-h-1 h-1/4 rounded-lg transition group-hover:ring-2 dark:ring-yellow-50 ring-green-400 ring-offset-2"
			>
				<img alt="podcast" class="rounded-lg object-cover" src={post.banner} decoding="async" />
			</div>

			<div class="mt-8 dark:text-gray-300 text-gray-500 text-md font-medium lowercase text-body">
				{new Date(post.date).toLocaleDateString()}
			</div>
			<h2 class="md:text-2xl text-xl font-bold leading-tighter text-black dark:text-white ">
				{post.title}
			</h2></a
		>
	</div>
</div>
