<script context="module" lang="ts">
	import { blockquote, h1} from '$components/typography/index';
	

	export { blockquote, h1 };
	
</script>

<script lang="ts">
	import { afterUpdate, onMount } from 'svelte';
	import Seo from './Seo.svelte';
	
	// Props
	/**
	 * @type string
	 */
	export let banner;
	/**
	 * @type string
	 */
	export let bannerCredit
	/**
	 * @type string
	 */
	export let title
	/**
	 * @type string
	 */
	export let description
	/**
	 * @type string[]
	 */
	export let keywords
	/**
	 * @type string
	 */
	export let filepath
	
	/**
	 * @type  import('$lib/types').Post[]
	 */
	export let similarPosts = [];
	/**
	 * @type string
	 */
	export let canonical

	/**
	 * @type string
	 */
	let currentUrl
	afterUpdate(() => {
		currentUrl = window.location.href;
	});
	
	let adsbygoogle = [{}]
	onMount(() => {
		if(window.adsbygoogle) {
			adsbygoogle = (window.adsbygoogle || []).push({});
		}
	})
</script>

<Seo {title} {description} {keywords} isBlogPost={true} canonical={canonical} />
<div class="w-full pb-4 px-0">
	<header
		class="post-header w-full bg-gray-900 flex item-end flex-col justify-center relative md:h-[32rem] h-[20rem] overflow-hidden"
	>
		<img
			src={banner}
			class=" overflow-cover w-full absolute top-0 left-0 z-0 max-h-[32rem] filter blur-sm"
			alt={title}
		/>
		<div class="flex flex-col max-w-[98vw] md:max-w-[40vw] z-10  self-end mx-auto md:ml-0 md:mr-12">
			<h1 class="font-sans text-left text-gray-100 font-bold text-2xl md:text-3xl pb-8 m-0 pl-4 md:px-0 [text-shadow:0_4px_8px_rgba(0,0,0,1),0_20px_8px_rgba(0,0,0,0.3)]">
				{title}
			</h1>
			<p
				class="text-left text-gray-100 font-body leading-tight text-lg max-w-4xl z-10 hidden md:block flex-grow m-0"
			>
				{description}
			</p>
			{#if bannerCredit!=null && bannerCredit!=='undefined'}
			<h4
				class="text-left text-gray-100 font-body leading-tight text-sm self-end absolute bottom-2 left-2 md:left-auto"
			>
				{@html bannerCredit}
			</h4>
			{/if}
		</div>
	</header>
	<article
		class="dark:text-gray-300 text-ebony-clay-800 py-12 mx-auto prose prose-lg dark:prose-dark mt-12 pt-[14rem] md:pt-[32rem]"
	>
		<!--INFOLINKS_ON-->
		<slot />

		<!--INFOLINKS_OFF-->
		<div class="border opacity-70 w-full mt-24 mb-12" />
		Te pareció interesante?
		Encuentra más contenido similar uniendote al <a class="underlined" href="/newsletter">Newsletter</a> o siguiendome en <a class="underlined" href="https://twitter.com/matiasfha" target="_blank">Twitter</a>.
		
		<footer class="flex items-center justify-end gap-4 pt-20">
			<a
				class="underlined text-ebony-clay-800 hover:text-ebony-clay-600 dark:text-gray-100 dark:hover:text-gray-200 focus:outline-none"
				href={`https://twitter.com/share?ref_src=twsrc%5Etfw&url=${currentUrl}`}
				>Comparte en Twitter</a
			>
			<a
				class="underlined text-ebony-clay-800 hover:text-ebony-clay-600 dark:text-gray-100 dark:hover:text-gray-200 focus:outline-none"
				href={`https://github.com/matiasfha/matias-sveltekit/edit/main/web/${filepath}`}
				>Edita en github</a
			>
		</footer>

		<!-- <input type="hidden" name="IL_IN_ARTICLE"> -->
		<ins class="adsbygoogle mt-10"
			style="display:block; text-align:center;"
			data-ad-layout="in-article"
			data-ad-format="fluid"
			data-ad-client="ca-pub-8352667732450998"
			data-ad-slot="2293002483"></ins>

		{#if similarPosts.length > 0}
		<div class="">
			<h3>Artículos relacionados</h3>
			<div class={`grid gap-2 grid-cols-1 md:grid-cols-${similarPosts.length}`}>
				{#each similarPosts as post}
					<div class="flex flex-col">
						<a href={`/blog/post/${post.slug}`} sveltekit:prefetch
			class="group peer relative block w-full focus:outline-none">
							<div class="rounded-lg max-h-40 transition group-hover:ring-2 dark:ring-yellow-50 ring-green-400 ring-offset-2">
								<img
									src={post.banner}
									alt={post.title}
									class="object-cover w-full max-h-40 object-center rounded-md" 
									/>
							</div>
							<h4 class="md:text-xl text-lg font-bold leading-tighter text-black dark:text-white absolute top-40">
								{post.title}
							</h4>
						</a>
					</div>
				{/each}
			</div>

		</div>
		{/if}		

	</article>
	
</div>

<style>
	.post-header {
		position: absolute;
		top: 0;
		left: 0;
		z-index: -1;
	}
	.post-header::after {
		width: 60vw;
		content: '';
		position: absolute;
		right: 0;
		top: 0;
		height: 100%;
		background: #111;
		opacity: 0.85;
		display: block;
		z-index: 5;
		mix-blend-mode: multiply;
		transform: skew(15deg, 0deg);
		transform-origin: top right;
		
	}
	@media (max-width: 767px) {
		.post-header::after {
			transform: none;
			display: none;
		}
	}
	ins iframe {
		border: 1px transparent;
		border-radius: 20px;
	}
</style>
