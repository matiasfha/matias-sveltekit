<script lang="ts">
	import type { Post } from '$lib/types';
	import RelativeDateFormat from './RelativeDateFormat.svelte';
	export let post: Post;

	import { t } from '$lib/translations';

</script>

<div class="flex flex-col">
	<div class="md:mb-4 mb-2">
		<a
			class="group peer relative block w-full focus:outline-none"
			href={post.slug}
			><div
				class="aspect-w-2 aspect-h-1 h-1/4 rounded-lg transition group-hover:ring-2 dark:ring-yellow-50 ring-green-400 ring-offset-2"
			>
				<img alt={post.title} class="rounded-lg object-cover cld-responsive" data-src={`${post.banner}`} src={post.banner} height="173" loading="lazy" decoding="async"/>
			</div>

			<div class="mt-8 dark:text-gray-300 text-gray-500 text-md font-medium lowercase text-body">
				{$t('blog.around')} <time datetime={post.date}><RelativeDateFormat date={post.date} /></time>
			</div>
			<span class="mt-8 dark:text-gray-300 text-gray-500 text-sm italic lowercase text-body">
				{$t('blog.reading')} {post.readingTime.text}
			</span>
			<h2 class="md:text-2xl text-xl font-bold leading-tighter text-black dark:text-white ">
				{post.title}
			</h2></a
		>
	</div>
</div>
