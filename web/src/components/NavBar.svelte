<script lang="ts">
	import logo from '$images/logo.png';
	import { fly, slide, blur } from 'svelte/transition';
	// @TODO this can go in sanity
	const menuLinks: { title: string; href: string }[] = [
		{
			title: 'Podcast',
			href: 'https://www.cafecon.tech'
		},
		{
			title: 'Blog',
			href: '/blog'
		},
		{
			title: 'Guest Writing',
			href: '/articles'
		},
		// {
		// 	title: 'Courses',
		// 	href: '/'
		// },
		{
			title: 'Newsletter',
			href: '/newsletter'
		},
		{
			title: 'Sobre mi',
			href: '/about'
		}
	];
	// Theme switcher
	import { theme } from '$lib/stores';
	const toggleTheme = () => {
		const current = theme.get().theme;
		if (current === 'light') {
			document.documentElement.classList.add('dark');
			theme.set({ theme: 'dark' });
		} else {
			document.documentElement.classList.remove('dark');
			theme.set({ theme: 'light' });
		}
		theme.subscribe((currentTheme) => {
			localStorage.setItem('theme', JSON.stringify(currentTheme));
		});
	};
	let menu = false;
</script>

<div class={`px-6 md:px-8 pt-9 pb-4 lg:px-10 lg:pt-12   dark:text-gray-200 text-gray-700`}>
	<nav class="flex items-center justify-between mx-auto md:max-w-8xl">
		<div class="flex flex-row items-center gap-4 md:gap-8 justify-between">
			<a href="/" sveltekit:prefetch>
				<img src={logo} alt="Matias Hernández Logo" width="48" height="48" />
			</a>
			<a
				class="underlined block whitespace-nowrap text-2xl font-medium focus:outline-none transition"
				href="/"><h1>Matias Hernández</h1></a
			>
		</div>
		<ul class="hidden lg:flex">
			{#each menuLinks as item}
				<li class="px-5 py-2">
					<a
						sveltekit:prefetch
						class="hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"
						href={item.href}>{item.title}</a
					>
				</li>
			{/each}

			<li>
				<button
					id="dark-mode-toggler"
					aria-label="Switch to dark mode"
					class="px-2 bg-ebony-clay-600 dark:bg-gray-100 rounded-full w-8 h-8 text-gray-100 dark:text-ebony-clay-800 mt-1"
					on:click={toggleTheme}
					><svg
						stroke="currentColor"
						fill="none"
						stroke-width="2"
						viewBox="0 0 24 24"
						stroke-linecap="round"
						stroke-linejoin="round"
						height="1em"
						width="1em"
						><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line
							x1="12"
							y1="21"
							x2="12"
							y2="23"
						/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line
							x1="18.36"
							y1="18.36"
							x2="19.78"
							y2="19.78"
						/><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line
							x1="4.22"
							y1="19.78"
							x2="5.64"
							y2="18.36"
						/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg
					></button
				>
			</li>
		</ul>

		<button
			on:click={() => (menu = !menu)}
			class="md:hidden self-end z-20 transform duration-500 ease-in-out hover:scale-110 motion-reduce:transform-none  dark:text-white text-ebony-clay-500 m-2 focus:outline-none"
		>
			<svg
				class="h-8 w-8"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				{#if menu}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				{:else}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h7"
					/>
				{/if}
			</svg>
		</button>

		{#if menu}
			<ul
				transition:blur={{ duration: 500 }}
				class="flex flex-col w-full h-full dark:bg-ebony-clay-600 bg-gray-500 dark:text-gray-200 text-ebony-clay-600 text-center z-10 fixed top-0 left-0 py-10 overflow-y-auto backdrop-filter backdrop-blur-lg bg-opacity-30"
			>
				{#each menuLinks as item}
					<li
						class="px-5 py-6 text-lg text-left border-b-2 dark:border-ebony-clay-100 border-ebony-clay-600"
					>
						<a
							sveltekit:prefetch
							class="hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"
							href={item.href}>{item.title}</a
						>
					</li>
				{/each}
				<li class="text-left px-5 py-6">
					<button
						id="dark-mode-toggler"
						aria-label="Switch to dark mode"
						class="px-2 bg-ebony-clay-100 dark:bg-gray-100 rounded-full w-8 h-8 text-gray-100 dark:text-ebony-clay-800 mt-1"
						on:click={toggleTheme}
						><svg
							stroke="currentColor"
							fill="none"
							stroke-width="2"
							viewBox="0 0 24 24"
							stroke-linecap="round"
							stroke-linejoin="round"
							height="1em"
							width="1em"
							><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line
								x1="12"
								y1="21"
								x2="12"
								y2="23"
							/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line
								x1="18.36"
								y1="18.36"
								x2="19.78"
								y2="19.78"
							/><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line
								x1="4.22"
								y1="19.78"
								x2="5.64"
								y2="18.36"
							/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg
						></button
					>
				</li>
			</ul>
		{/if}
	</nav>
</div>
