<script lang="ts">
	export let picture: {
		alt: string;
		sources: {
			webp?: string;
			png: string;
			svg?: string;
			jpg?: string;
		};
	};
	export let content: string;
	export let highlight: string;
</script>

<div class="bg-gray-200  dark:bg-ebony-clay-600 border border-purple pl-4 pr-8 rounded-md py-2">
	<p class="text-gray-800 dark:text-gray-200 uppercase mb-3 text-xs">sponsor</p>
	<div class="flex relative flex-wrap font-body text-base">
		<em class="static w-full text-gray-800 dark:text-gray-200"
			>Code with Andrea is free for everyone. Help me keep it that way by checking out this sponsor:</em
		>
		<figure class="mr-3 w-20 h-20 !my-0 s">
			<picture>
				<source srcset={Object.values(picture.sources).join(',')} type="image/webp" />
				<img class="!mt-5 rounded-md" src={picture.sources.png} alt={picture.alt} /></picture
			>
		</figure>
		<p class="pt-0 m-0 flex-1">
			<span class="text-ebony-500 dark:text-yellow-300  bg-indigo-200 dark:bg-gray-600 p-1 rounded"
				><b>{highlight}</b></span
			>
			{content}
		</p>
	</div>
</div>
