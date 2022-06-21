<script lang="ts">
	type Picture = {
		alt: string;
		sources: {
			webp?: string;
			png: string;
			svg?: string;
			jpg?: string;
		};
	};
	export let picture: Picture = {
		alt: "Matias Hernández Logo",
		sources: {
		png: '/logo.png'
		}
	}
	export let content = "Tu producto o servicio podría estar aquí";
	export let highlight: string;
</script>


<div class="bg-gray-100  dark:bg-ebony-clay-600 border border-purple pl-4 pr-8 rounded-md py-2 opacity-80">
	<p class="text-gray-800 dark:text-gray-200 uppercase mb-3 text-xs">sponsor</p>
	<div class="flex relative flex-wrap  ">
		<em class="static w-full text-gray-800 dark:text-gray-200 font-body text-base"
			>
			El contenido de este sitio es y será siempre gratuito para todos. Ayudame a mantenerlo así convirtiendote en auspiciador.</em
		>
		<figure class="mr-3 w-20 h-20 !my-0 ">
			<picture>
				<source srcset={Object.values(picture.sources).join(',')} type="image/webp" />
				<img class="!mt-5 rounded-md" src={picture.sources.png} alt={picture.alt} /></picture
			>
		</figure>
		<p class="pt-0 m-0 flex-1 !pb-8">
			{#if highlight}
			<span class="text-ebony-500 dark:text-yellow-300  bg-indigo-200 dark:bg-gray-600 p-1 rounded"
				><b>{highlight}</b></span
			>
			{/if}
			{content}
		</p>
	</div>
</div>
