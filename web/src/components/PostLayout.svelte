<script context="module">
	import { blockquote, h1 } from '$components/typography/index';
	import jsyaml from 'js-yaml';
	export { blockquote, h1 };
</script>

<script lang="ts">
	import { t } from '$lib/translations';
	export let data: PageData;

	import { onMount } from 'svelte';
	import Seo from './Seo.svelte';
	import RelativeDateFormat from './RelativeDateFormat.svelte';
	import type { PageData } from '../routes/$types';

	// Props

	export let banner = '';
	export let bannerCredit = '';
	export let title = '';
	export let description = '';
	export let keywords = [];
	export let filepath = '';

	let similarPosts = data?.similarPosts || [];
	export let canonical = '';
	export let readingTime = {};
	export let date = '';

	export let likes = data?.likes || [];
	export let retweet = data?.retweet || [];
	export let lang= 'es';

	export let toc: string;

	const tocData = JSON.parse(jsyaml.load(toc));

	$: currentUrl = '';
	onMount(() => {
		currentUrl = window.location.href;
	});

	const newsletterId = lang === 'es' ? 'c4r8t8' : 'h7k7g0';
</script>

<Seo {title} {description} {keywords} isBlogPost={true} {canonical} {banner} />
<header
	class="post-header w-full bg-gray-900 flex item-end flex-col justify-center relative md:h-[32rem] h-[23rem] overflow-hidden"
>
	<div
		class="absolute top-0 left-0 w-full h-full blur-sm bg-contain bg-no-repeat"
		style={`background-image:url(${banner})`}
	/>

	<div
		class="flex flex-col max-w-[98vw] md:max-w-[40vw] z-10  self-end mx-auto md:ml-0 md:mr-12 mt-0 text-left font-body leading-tight text-gray-100"
	>
		<h1
			class="font-sans text-left font-bold text-2xl md:text-3xl pb-8 m-0 pl-4 md:px-0 [text-shadow:0_4px_8px_rgba(0,0,0,1),0_20px_8px_rgba(0,0,0,0.3)] p-name"
		>
			{title}
		</h1>
		<div class="text-sm self-end flex-grow m-0 pt-2 pb-8 mr-8">
			<time class="dt-published" datetime={date}>
				<RelativeDateFormat {date} />
			</time>
			- {#if readingTime} {readingTime.text} {/if}
		</div>
		<p class="text-lg max-w-4xl z-10 hidden md:block flex-grow m-0 self-end pl-2">
			{description}
		</p>

		{#if bannerCredit != null && bannerCredit !== 'undefined'}
			<h4 class="text-sm self-end absolute bottom-2 left-2 md:left-auto">
				{@html bannerCredit}
			</h4>
		{/if}
	</div>
</header>
<div class="w-full pb-4 px-0 h-entry overflow-x-hidden h-full">
	<main class="flex max-w-6xl flex-col lg:flex-row-reverse justify-center items-start relative ">
		<aside
			class="relative lg:sticky flex flex-col w-full md:w-64 grow-0 shrink top-8 lg:top-12 mb-8 mx-auto items-center prose dark:prose-dark dark:text-gray-300 text-ebony-clay-800 "
		>
			<figure class="flex flex-col items-center mb-2">
				<img
					class="object-contain rounded-full w-[130px]"
					src="https://res.cloudinary.com/matiasfha/image/fetch/f_auto,q_auto,c_fit/https://matiashernandez.dev/me-optimized.png"
					alt="This is me :D"
				/>
				<figcaption class="text-sm lg:text-md dark:text-gray-300 text-ebony-800">
					{$t('common.writtenBy')} Matías Hernández
				</figcaption>
			</figure>
			<div class="w-full border-t dark:border-ebony-clay-400 border-gray-500 inset-1" />
			<p class="text-xs lg:text-md">
				{#if lang === 'es'}
					Hola!. Comparto este tipo de posts de forma regular y puedes manterte al día si te unes a
					mi newsletter. <strong class="text-xs lg:text-md"
						>Únete para recibir lo mejor de mi contenido directamente en tu inbox.</strong
					>
				{/if}
			</p>
			{#if lang === 'es'}
				<form
					class="flex flex-col justify-between mx-auto mt-4 items-center w-full"
					action="https://app.convertkit.com/forms/4010991/subscriptions"
					data-code={newsletterId}
					method="post"
					data-sv-form="4010991"
					data-uid="83d83664cf"
					data-format="inline"
					data-version="5"
					target="_blank"
				>
					<input type="hidden" name="anticsrf" value="true" />
					<input
						type="email"
						name="email_address"
						required
						placeholder="Email"
						class="px-4 font-medium text-sm rounded-md w-full "
						autocomplete="email"
					/>
					<button
						type="submit"
						class="rounded-md text-sm font-bold text-[#6366F1] dark:text-yellow-300 py-1 border boder-[#6366F1] dark:border-yellow-300 text-center mt-4 w-full "
						>{#if lang == 'es'}
							Me encantaría
						{/if}
					</button>
				</form>
			{/if}

			<details class="w-full sm:mt-2 mt-10 text-sm" open={false}>
				<summary class="text-bold py-2">{$t('common.tableOfContent')}</summary>
				<ul class="w-full opacity-75">
					{#each tocData as item}
						<li>
							<a href={`#${item.slug}`}>{item.value}</a>
						</li>
					{/each}
				</ul>
			</details>
			<!-- Sidebar -->
			<ins
				class="adsbygoogle sm:hidden"
				style="display:block"
				data-ad-client="ca-pub-8352667732450998"
				data-ad-slot="6240388954"
				data-ad-format="auto"
				data-full-width-responsive="true"
			/>
		</aside>
		<article
			class="dark:text-gray-300 text-ebony-clay-800 pb-4 sm:pt-2 pt-12 mx-auto prose prose-lg dark:prose-dark prose-a:whitespace-pre-line e-content px-4 grow shrink basis-[686px]"
		>
			<slot />

			<div class="flex flex-col mt-20 pb-10 border-b border-t border-gray-500 border-collapse">
				<div>
					<h3>{$t('common.post.footer_title')}</h3>
					<p>
						{@html $t('common.post.footer_body')}
					</p>
				</div>
				<div class="flex flex-row justify-between items-center">
					<a href="https://www.buymeacoffee.com/matiasfha"
						><img
							loading="lazy"
							decoding="async"
							alt="invite me a coffee"
							src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=matiasfha&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff"
						/></a
					>
					<a
						class="underlined "
						href={`https://github.com/matiasfha/matias-sveltekit/edit/main/web/${filepath}`}
						>⚙️ {$t('common.post.footer_edit')}</a
					>
				</div>
			</div>
			{#if likes.length || retweet.length}
				<section
					class="md:mt-10 py-6 px-4 mx-auto mb-20 rounded-xl w-full border border-gray-400 flex flex-col gap-4"
				>
					<span class="text-lg dark:text-gray-100">{$t('common.post.webmentions.title')}</span>

					<a
						href={`https://twitter.com/intent/tweet/?text=Te%20invito%20a%20leer%20este%20buen%20artículo&url=${currentUrl}/&via=matiafsha`}
						target="_blank"
						rel="noopener noreferrer"
						class="bg-[#1d9bf0] hover:bg-blue-400 transition-colors text-white p-3 rounded-xl text-sm inline-flex items-center focus:outline-none w-52"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="mr-2"
							><path
								d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
							/>
						</svg>
						{$t('common.post.webmentions.share')}
					</a>

					{#if likes.length > 0}
						<div class="flex -space-x-4">
							<span
								class="px-2 rounded-full text-gray-700 flex items-center h-8 text-xs mr-6 bg-gray-300"
								>{$t('common.post.webmentions.likes')} ❤️
							</span>
							{#each likes as entry}
								<a href={entry.author.url}>
									<img
										class="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 m-0"
										src={entry.author.photo}
										alt={entry.author.name}
										loading="lazy"
									/>
								</a>
							{/each}
							{#if likes.length > 10}
								<span
									class="flex justify-center items-center w-8 h-8 text-xs font-medium text-white bg-gray-700 rounded-full border-2 border-white hover:bg-gray-600 dark:border-gray-800"
									>+{retweet.length - 10}</span
								>
							{/if}
						</div>
					{/if}
					{#if retweet.length > 0}
						<div class="flex -space-x-4">
							<span
								class="px-2 rounded-full text-gray-700 flex items-center h-8 text-xs mr-6 bg-gray-300"
								>{$t('common.post.webmentions.retweet')}</span
							>
							{#each retweet as entry}
								<a href={entry.author.url}>
									<img
										class="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 m-0"
										src={entry.author.photo}
										alt={entry.author.name}
										loading="lazy"
									/>
								</a>
							{/each}
							{#if retweet.length > 10}
								<span
									class="flex justify-center items-center w-8 h-8 text-xs font-medium text-white bg-gray-700 rounded-full border-2 border-white hover:bg-gray-600 dark:border-gray-800"
									>+{retweet.length - 10}</span
								>
							{/if}
						</div>
					{/if}
				</section>
			{/if}

			{#if similarPosts.length > 0}
				<section class="prose prose-lg dark:prose-dark mx-auto mt-20">
					<h3>📖 {$t('common.post.keep_reading')}</h3>
					<div class={`grid gap-2 grid-cols-1 md:grid-cols-${similarPosts.length}`}>
						{#each similarPosts as post}
							<div class="flex flex-col">
								<a href={post.slug} class="group peer relative block w-full focus:outline-none">
									<div
										class="rounded-lg h-40 transition group-hover:ring-2 dark:ring-yellow-50 ring-green-400 ring-offset-2"
									>
										<img
											src={post.banner}
											alt={post.title}
											class="object-cover w-full h-40 object-center rounded-md"
										/>
									</div>
									<span class="text-sm"
										>around <time datetime={post.date}>
											<RelativeDateFormat date={post.date} />
										</time>
										Reading time: {post.readingTime.text}
									</span>
									<h4
										class="md:text-xl text-lg font-bold leading-tighter text-black dark:text-white"
									>
										{post.title}
									</h4>
								</a>
							</div>
						{/each}
						<ins
							class="adsbygoogle"
							style="display:block"
							data-ad-format="fluid"
							data-ad-layout-key="-63+dj-1k-3w+o7"
							data-ad-client="ca-pub-8352667732450998"
							data-ad-slot="3558385291"
						/>
					</div>
				</section>
			{/if}
		</article>
	</main>
	<!-- </article> -->
	<div class="p-name invisible">{title}</div>
	<a href={currentUrl} class="invisible u-url">Current Url</a>
	<a rel="author" class="p-author h-card invisible" href="https://matiashernandez.dev"
		>Matías Hernández</a
	>
</div>

<style>
	.post-header {
		z-index: -1;
		width: 100vw;
		position: relative;
		left: 50%;
		margin-left: -50vw;
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

	.adsbygoogle {
		min-width: 250px;
	}
</style>
