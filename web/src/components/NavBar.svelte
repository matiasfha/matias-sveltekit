<script lang="ts">
	import logo from '$images/logo.png';
	export let type: 'blog' | undefined;

	// @TODO this can go in sanity
	const menuLinks: { title: string; href: string }[] = [
		{
			title: 'Podcast',
			href: '/'
		},
		{
			title: 'Blog',
			href: '/blog'
		},
		{
			title: 'Articles',
			href: '/'
		},
		{
			title: 'Courses',
			href: '/'
		},
		{
			title: 'Newsletter',
			href: '/'
		},
		{
			title: 'About',
			href: '/'
		}
	];
	// Theme switcher
	import { theme } from '$lib/stores';
	import { onMount } from 'svelte';
	export let localTheme: 'dark' | 'light';
	onMount(() => {
		if (!('theme' in localStorage)) {
			theme.useLocalStorage();
			if (window.matchMedia('(prefers-color-scheme:dark').matches) {
				localTheme = 'dark';
				theme.set({ theme: 'dark' });
			} else {
				localTheme = 'light';
				theme.set({ theme: 'light' });
			}
		} else {
			localTheme = theme.get().theme;
			theme.useLocalStorage();
		}

		if (localTheme === 'light') {
			document.documentElement.classList.remove('dark');
		} else {
			document.documentElement.classList.add('dark');
		}
	});

	const toggleTheme = () => {
		const current = theme.get().theme;
		if (current === 'light') {
			document.documentElement.classList.add('dark');
			theme.set({ theme: 'dark' });
		} else {
			document.documentElement.classList.remove('dark');
			theme.set({ theme: 'light' });
		}
	};
</script>

<div
	class={`px-10 pt-9 pb-4 lg:pt-12  border-b dark:border-gray-100 border-gray-300 dark:text-gray-50 text-gray-900 ${
		type === 'blog' ? 'blog' : ''
	}`}
>
	<nav class="flex items-center justify-between mx-auto max-w-8xl">
		<div class="flex flex-row items-center gap-8 justify-between">
			<a href="/">
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
						class="hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"
						href={item.href}>{item.title}</a
					>
				</li>
			{/each}

			<li>
				<button
					id="dark-mode-toggler"
					aria-label="Switch to dark mode"
					class="px-2 bg-ebony-clay-300 dark:bg-gray-100 rounded-full w-8 h-8 text-gray-100 dark:text-ebony-clay-800 mt-1"
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
	</nav>
</div>

<style>
	.blog {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 50;
		padding-top: 1.5rem;
		border: 0;
	}
	.blog nav {
		width: 100vw;
		color: #eeeeee;
		padding-right: 6rem;
	}
</style>
