<script lang="ts">
	import { t, locale } from '$lib/translations';
	import About from './About.svelte';

	// import AMA from './AMA.svelte';
	import Calendly from './Calendly.svelte';
	import Coffee from './Coffee.svelte';
	let currentTab = 2;

	const tabs = [
		// {
		// 	id: 1,
		// 	text: $t('about.ask')
		// },
		{
			id: 2,
		text: $t('about.call')
		},
		{
			id: 3,
			text: $t('about.coffee')
		},
		{
			id: 4,
			text: $t('about.uses')
		}
	];

	function handleTab(tab: typeof tabs[0]) {
		currentTab = tab.id;
	}
</script>

<div class="relative mx-auto min-w-0 break-word bg-slate-200 w-full mb-6 shadow-lg rounded-xl">
	<div class="px-6">
		<div class="flex flex-wrap justify-center">
			<div class="w-full flex justify-center">
				<div class="relative">
					<img
						class="shadow-xl rounded-full align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-[150px]"
						src="https://res.cloudinary.com/matiasfha/image/upload/f_auto,q_auto,c_scale,w_150/v1661176031/photo-removebg-preview_vrjcf3.png"
						alt="This is me :D"
					/>
				</div>
			</div>
			<h1 class="text-6xl mt-32 flex self-center">{$t('about.title')}</h1>
			<div class="w-full text-center" role="tablist">
				<div class="flex justify-center lg:pt-4 pt-8 pb-0">
					{#each tabs as tab}
						<div
							class="p-3 text-center cursor-pointer border-x-0 border-t-0 border-b-2 border-transparent hover:border-transparent focus:border-transparent transition-all duration-100 ease-in-out"
							role="presentation"
							class:active={currentTab === tab.id}
							aria-selected={tab.id === currentTab}
						>
							<button
								on:click={() => handleTab(tab)}
								class="text-sm font-bold block uppercase tracking-wide text-slate-700"
								>{tab.text}</button
							>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- {#if currentTab === 1}
			<AMA />
		{/if} -->

		{#if currentTab === 2}
			<Calendly />


		{/if}

		{#if currentTab === 3}
			<Coffee />
		{/if}
		{#if currentTab === 4}
			<About />
		{/if}
	</div>
</div>

<style>
	.active {
		color: #6366f1;
		border-color: #6366f1;
	}
</style>
