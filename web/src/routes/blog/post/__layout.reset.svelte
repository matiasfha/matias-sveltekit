<script>
	import '../../../app.postcss';
	import logo from '$lib/images/logo.png';
	import Footer from '$lib/components/Footer.svelte';
</script>

<!-- Navbar -->
<div class="px-10 pt-6 absolute top-0 left-0 z-50">
	<nav class="dark:text-gray-50 text-gray-900 flex items-center justify-between w-screen">
		<div class="flex flex-row items-center gap-8 justify-between">
			<a href="/">
				<img src={logo} alt="Matias Hernández Logo" width="48" height="48" />
			</a>
			<a
				class="underlined block whitespace-nowrap text-2xl font-medium focus:outline-none transition"
				href="/"><h1>Matias Hernández</h1></a
			>
		</div>
		<ul class="hidden lg:flex pr-20">
			<li class="px-5 py-2">
				<a
					class="hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"
					href="/">Podcast</a
				>
			</li>
			<li class="px-5 py-2">
				<a
					class="hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"
					href="/blog">Blog</a
				>
			</li>
			<li class="px-5 py-2">
				<a
					class="hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"
					href="/blog">Artículos</a
				>
			</li>
			<li class="px-5 py-2">
				<a
					class="hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"
					href="/">Cursos</a
				>
			</li>
			<li class="px-5 py-2">
				<a
					class="hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"
					href="/">Workshops</a
				>
			</li>
			<li class="px-5 py-2">
				<a
					class="hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"
					href="https://microbytes.dev">newsletter</a
				>
			</li>
			<li class="px-5 py-2">
				<a
					class="hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"
					href="/">Sobre Mí</a
				>
			</li>
			<li>
				<button
					id="dark-mode-toggler"
					aria-label="Switch to dark mode"
					class="css-1xg1y4o-ButtonToggler e5j3spd0"
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

<slot />

<Footer />

<style>
	button {
		border-radius: 9999px;
		outline: transparent solid 2px;
		outline-offset: 2px;
		border-width: 0px;
		width: 2.5rem;
		height: 2.5rem;
		cursor: pointer;
		padding-left: 0.7rem;
		background-color: rgb(0, 0, 0);
		color: rgba(196, 172, 147, 1);
	}
</style>
