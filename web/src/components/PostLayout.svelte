<script context="module">
	import { blockquote, h1} from '$components/typography/index';
	import { format } from 'date-fns';

	export { blockquote, h1 };
	
</script>

<script>
	/** @type {import('./$types').PageData} */
	export let data;
	
	
	import { afterUpdate, onMount } from 'svelte';
	import Seo from './Seo.svelte';
	import { Cloudinary } from 'cloudinary-core'
	// Props
	
	export let banner= "";
	export let bannerCredit= "";
	export let title= "";
	export let description= "";
	export let keywords= [];
	export let filepath= "";
	
	let similarPosts = data?.similarPosts || [];
	export let canonical= "";
	export let readingTime= {};
	export let date = 0

	export let likes = data?.likes || []
	export let retweet = data?.retweet || []
		

	let currentUrl= "";
	afterUpdate(() => {
		currentUrl = window.location.href;
		const cl = Cloudinary.new({ cloud_name: 'matiasfha' });
		cl.responsive()
	});
	
	let adsbygoogle = [{}]
	onMount(() => {
		if(window.adsbygoogle) {
			adsbygoogle = (window.adsbygoogle || []).push({});
		}
	})
	
</script>


<svelte:head>
  	<!-- Infolinks ads  -->
	<script type="text/javascript">
		var infolinks_pid = 3369090;
		var infolinks_wsid = 0;
	</script>
	<script type="text/javascript"  defer src="https://resources.infolinks.com/js/infolinks_main.js"></script>
	<script type="text/javascript"  defer async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8352667732450998"
     crossorigin="anonymous"></script>

</svelte:head>

<Seo {title} {description} {keywords} isBlogPost={true} canonical={canonical} banner={banner} />
<div class="w-full pb-4 px-0 h-entry" >
	<header
		class="post-header w-full bg-gray-900 flex item-end flex-col justify-center relative md:h-[32rem] h-[23rem] overflow-hidden"
	>
		<img
			src={banner}
			data-src={banner}
			class=" overflow-cover w-full absolute top-0 left-0 z-0 max-h-[32rem] h-[12rem] md:h-auto filter blur-sm u-photo cld-responsive"
			alt={title}
		/>
		<div class="flex flex-col max-w-[98vw] md:max-w-[40vw] z-10  self-end mx-auto md:ml-0 md:mr-12 mt-[14rem] md:mt-0 text-left font-body leading-tight text-gray-100">
			<h1 class="font-sans text-left font-bold text-2xl md:text-3xl pb-8 m-0 pl-4 md:px-0 [text-shadow:0_4px_8px_rgba(0,0,0,1),0_20px_8px_rgba(0,0,0,0.3)] p-name">
				{title}
			</h1>
			<div
				class="text-sm self-end flex-grow m-0 pt-2 pb-8 mr-8"
			>
				<time class="dt-published" datetime="YYYY-MM-DD HH:MM:SS">{format(new Date(date), 'dd/MM/yyyy')}</time> - {readingTime.text}
			
			</div>
			<p
				class="text-lg max-w-4xl z-10 hidden md:block flex-grow m-0 self-end pl-2"
			>
				{description}
			</p>
			
			{#if bannerCredit!=null && bannerCredit!=='undefined'}
			<h4
				class="text-sm self-end absolute bottom-2 left-2 md:left-auto"
			>
				{@html bannerCredit}
			</h4>
			{/if}
		</div>
	</header>
	<article
		class="dark:text-gray-300 text-ebony-clay-800 py-12 mx-auto prose prose-lg dark:prose-dark mt-12 pt-[14rem] md:pt-[32rem] prose-a:whitespace-pre-line e-content"
	>
		<!--INFOLINKS_ON-->
		<slot />

		<!--INFOLINKS_OFF-->
		<div class="flex flex-col mt-20 pb-10 border-b border-t border-gray-500 border-collapse">

			<div>
			<h3>😃 Gracias por leer!</h3>
			<p>
			Te pareció interesante?
			Encuentra más contenido similar uniendote al <a class="underlined" href="https://matiashernandez.dev/newsletter">Newsletter</a> o siguiendome en 
			<a class="underlined" href="https://twitter.com/matiasfha" target="_blank">Twitter</a>.
			</p>
			</div>
			<a
					class="underlined self-end"
					href={`https://github.com/matiasfha/matias-sveltekit/edit/main/web/${filepath}`}
					>⚙️ Edita en github</a
				>
		</div>
		
	</article>
	{#if likes.length || retweet.length}
	<section class="md:mt-10 py-6 px-4 mx-auto mb-20 rounded-xl md:w-3/5 border border-gray-400 flex flex-col gap-4">
		<span class="text-lg dark:text-gray-100">Sigue la conversación en Twitter</span>
		
		<a
			href={`https://twitter.com/intent/tweet/?text=Te%20invito%20a%20leer%20este%20buen%20artículo&url=${currentUrl}/&via=matiafsha`}
			target="_blank" rel="noopener noreferrer"
			class="bg-[#1d9bf0] hover:bg-blue-400 transition-colors text-white p-3 rounded-xl text-sm inline-flex items-center focus:outline-none w-52">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
			</svg> Comparte en Twitter
		</a>
			
		
		{#if likes.length > 0 }
		<div class="flex -space-x-4">
			<span class="px-2 rounded-full text-gray-700 flex items-center h-8 text-xs mr-4 bg-gray-300">han dado Like ❤️ </span>
			{#each likes as entry}
			<a href={entry.author.url}>
				<img class="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800" src="{entry.author.photo}" alt="{entry.author.name}" loading="lazy">
			</a>
			{/each}
			{#if likes.length > 10}
				<span class="flex justify-center items-center w-8 h-8 text-xs font-medium text-white bg-gray-700 rounded-full border-2 border-white hover:bg-gray-600 dark:border-gray-800" href="#">+{retweet.length - 10}</span>
			{/if}
		</div>		
		{/if}
		{#if retweet.length > 0}
		
		<div class="flex -space-x-4">
			<span class="px-2 rounded-full text-gray-700 flex items-center h-8 text-xs mr-4 bg-gray-300">han hecho RT</span>
			{#each retweet as entry}
			<a href={entry.author.url}>
				<img class="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800" src="{entry.author.photo}" alt="{entry.author.name}" loading="lazy">
			</a>
			{/each}
			{#if retweet.length > 10}
				<span class="flex justify-center items-center w-8 h-8 text-xs font-medium text-white bg-gray-700 rounded-full border-2 border-white hover:bg-gray-600 dark:border-gray-800" href="#">+{retweet.length - 10}</span>
			{/if}
		</div>		
		{/if}			
		
	</section>
	{/if}

		
		<ins class="adsbygoogle mt-10"
			style="display:block; text-align:center;"
			data-ad-layout="in-article"
			data-ad-format="fluid"
			data-ad-client="ca-pub-8352667732450998"
			data-ad-slot="2293002483"></ins>

		{#if similarPosts.length > 0}
		<section class="prose prose-lg dark:prose-dark mx-auto mt-20">
			<h3>📖 Continúa leyendo</h3>
			<div class={`grid gap-2 grid-cols-1 md:grid-cols-${similarPosts.length}`}>
				{#each similarPosts as post}
					<div class="flex flex-col">
						<a href={post.slug}
			class="group peer relative block w-full focus:outline-none">
							<div class="rounded-lg h-40 transition group-hover:ring-2 dark:ring-yellow-50 ring-green-400 ring-offset-2">
								<img
									src={post.banner}
									alt={post.title}
									class="object-cover w-full h-40 object-center rounded-md" 
									/>
							</div>
							<span class="text-sm"><time datetime="YYYY-MM-DD HH:MM:SS">{format(new Date(post.date), 'dd/MM/yyyy')}</time> - {post.readingTime.text}	</span>
							<h4 class="md:text-xl text-lg font-bold leading-tighter text-black dark:text-white">
								{post.title}
							</h4>
						</a>
					</div>
				{/each}
			</div>

		</section>
		{/if}		

	<!-- </article> -->
	<div class="p-name invisible">{title}</div>
	<a href={currentUrl} class="invisible u-url">Current Url</a>
	<a rel="author" class="p-author h-card invisible" href="https://matiashernandez.dev">Matías Hernández</a>
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
