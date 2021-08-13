<script context="module" lang="ts">
	export async function load({ fetch }) {
		const url = '/api/latest.json';
		const res = await fetch(url);
		if (res.ok) {
			const latest = await res.json();
			return {
				props: {
					latest
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script>

<script lang="ts">
	import type { Latest } from 'src/types';

	import Hero from '$components/Hero.svelte';
	import Featured from '$components/Featured.svelte';
	import LatestSection from '$components/Latest.svelte';
	import microbytes from '$images/microbytes.png';

	export let latest: Latest[];
</script>

<Hero />

<Featured
	image="https://storage.buzzsprout.com/variants/xdwqi3lrt55higf78atbhwp8w8of/8d66eb17bb7d02ca4856ab443a78f2148cafbb129f58a3c81282007c6fe24ff2.jpg"
	title="Jelly Drops, Design and Testing with Colby Fayock"
	meta="3rd Season Episode 3"
	description=""
	url="https://www.cafecon.tech/1081172/8996360-jelly-drops-design-and-testing-with-colby-fayock"
	type="podcast"
	podcastId="8996360"
/>

<!-- Latest -->
<LatestSection {latest} />
<!-- Favorites-->
<section class="mt-24">
	<h2 class="text-xl sm:font-semibold font-bold mb-3 dark:text-white text-ebony-clay-800s">
		Staff Picks and Favorites
	</h2>
	<div class="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-4">
		<div
			class="bg-white dark:bg-gray-800 dark:text-gray-200 shadow-sm rounded-lg overflow-hidden p-5 text-center hover:ring-2 dark:ring-yellow-50 ring-green-400 ring-offset-2"
		>
			<a href="/" class="focus:outline-none">
				<div class="h-64 flex items-center justify-center mb-12">
					<img
						alt=""
						aria-hidden="true"
						role="presentation"
						src="https://matiashernandez.dev/static/ac0c22c494eadef3f1fc51305ceb9825/f3dec/hooks-3d62.png"
						class="rounded-lg object-contain max-h-64"
					/>
				</div>
			</a>
			<div>
				<h3 class="text-xs text-green-600 dark:text-green-300 mb-2 mt-1 text-body">Curso</h3>
				<a href="/"
					><h2 class="text-lg font-bold leading-tighter py-3">
						Construye Componentes Avanzados con React Hooks y Patrones de Diseño
					</h2></a
				>
			</div>
		</div>
		<div
			class="bg-white dark:bg-gray-800 dark:text-gray-200 shadow-sm rounded-lg overflow-hidden p-5 text-center hover:ring-2 ring-yellow-50 ring-offset-2"
		>
			<a href="https://draft.dev/learn/hugo-vs-gatsby">
				<div class="h-64 flex items-center justify-center mb-12">
					<img
						alt=""
						aria-hidden="true"
						role="presentation"
						src="https://draft.dev/learn/assets/posts/c4f82d27.png"
						class="rounded-lg object-contain max-h-64"
					/>
				</div>
			</a>
			<div>
				<div>
					<h3 class="text-xs text-green-600 dark:text-green-300 mb-2 mt-1">Article</h3>

					<a
						href="/playlists/build-a-corgi-up-boop-web-app-with-netlify-serverless-functions-and-hasura-553c"
						><h2 class="text-lg font-bold leading-tighter py-3">
							Roundup: Gatsby vs Hugo - Draft.dev
						</h2></a
					>
				</div>
			</div>
		</div>
		<div
			class="bg-white dark:bg-gray-800 dark:text-gray-200 shadow-sm rounded-lg overflow-hidden p-5 text-center hover:ring-2 ring-yellow-50 ring-offset-2"
		>
			<a
				href="https://www.cafecon.tech/1081172/8869619-testing-react-typescript-and-remix-with-kent-c-dodds"
			>
				<div class="h-64 flex items-center justify-center mb-12">
					<img
						alt=""
						aria-hidden="true"
						role="presentation"
						class="rounded-lg object-contain max-h-64"
						src="https://www.cafecon.tech/rails/active_storage/representations/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCRkpWZHdJPSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--99a10b33c8ef56f3f4525e3160173ce5e89c850a/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCam9VWTI5dFltbHVaVjl2Y0hScGIyNXpld282QzNKbGMybDZaVWtpRHpFME1EQjRNVFF3TUY0R09nWkZWRG9NWjNKaGRtbDBlVWtpQzJObGJuUmxjZ1k3QjFRNkMyVjRkR1Z1ZEVraURqRTBNREI0TVRRd01BWTdCMVE2REhGMVlXeHBkSGxwVlRvUFkyOXNiM0p6Y0dGalpVa2lDWE5TUjBJR093ZFUiLCJleHAiOm51bGwsInB1ciI6InZhcmlhdGlvbiJ9fQ==--62cccdad7c2145af9102d69a13c480276ec82e2e/Art%20Work%20(1)%201-2.jpg"
					/>
				</div>
			</a>
			<div>
				<div>
					<h3 class="text-xs text-green-600 dark:text-green-300 mb-2 mt-1">Podcast</h3>
					<a
						href="https://www.cafecon.tech/1081172/8869619-testing-react-typescript-and-remix-with-kent-c-dodds"
					>
						<h2 class="text-lg font-bold leading-tighter py-3">
							Testing, React, Typescript and Remix with Kent C. Dodds
						</h2></a
					>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="mt-24">
	<div
		class="relative flex items-center justify-center bg-white dark:text-white  text-ebony-clay-800 overflow-hidden rounded-lg shadow-sm dark:bg-gray-800 focus:outline-none transition hover:ring-2 ring-yellow-50 ring-offset-2"
	>
		<div class="relative z-10 px-5 sm:text-left text-center py-10">
			<div
				class="space-y-5 mx-auto flex flex-col items-center justify-center max-w-screen-xl lg:px-8 w-full sm:mb-4 md:my-12 lg:m-0 mt-0 mb-15"
			>
				<div
					class="flex lg:flex-row flex-col items-center justify-center sm:space-x-10 sm:space-y-0 space-y-5 0 w-full xl:pr-16"
				>
					<div class="flex-shrink-0">
						<img
							alt="illustration for React Desde Cero"
							src={microbytes}
							decoding="async"
							class="object-contain"
						/>
					</div>
					<div class="flex flex-col lg:items-start items-center w-full">
						<h3
							class="text-xs text-green-600 dark:text-green-300 uppercase font-semibold mb-2 font-body"
						>
							Microcursos en tu inbox!
						</h3>
						<h1
							class="lg:text-5xl md:text-4xl sm:text-3xl text-2xl font-extrabold dark:text-white text-gray-800 leading-tight"
						>
							¿Aún luchas con Javascript y el desarrollo web?
						</h1>

						<div class="max-w-screen-md font-body">
							<p>
								​Unete a Micro Bytes un newsletter semanal de micro cursos. Recibirás una colección
								de contenidos para mejorar tu conocimiento en desarrollo web y darle un giro a tu
								carrera, directamente en tu correo.
							</p>
						</div>
					</div>
				</div>
				<div class="relative w-full">
					<form
						method="post"
						action="/TODO: set up action for newsletter"
						enctype="application/x-www-form-urlencoded"
						class="mt-8 space-y-4 w-full grid grid-cols-2 gap-4"
					>
						<div class="flex flex-col gap-4">
							<input
								type="text"
								name="firstName"
								autocomplete="name"
								placeholder="First name"
								aria-label="First name"
								class="border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-6 w-full dark:text-white bg-transparent border rounded-lg focus:outline-none"
							/>
							<input
								type="email"
								name="email"
								autocomplete="email"
								placeholder="email"
								aria-label="email"
								class="border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-6 w-full dark:text-white bg-transparent border rounded-lg focus:outline-none"
								value=""
							/>
						</div>
						<button
							type="submit"
							class="text-primary inline-flex items-center justify-self-end text-left font-medium focus:outline-none cursor-pointer transition pt-4"
							><span class="mr-8 text-xl font-medium">Sign me up</span>
							<div class="relative inline-flex flex-none items-center justify-center p-1 w-14 h-14">
								<div class="absolute text-gray-200 dark:text-gray-600">
									<svg width="60" height="60"
										><circle
											stroke="currentColor"
											stroke-width="2"
											fill="transparent"
											r="28"
											cx="30"
											cy="30"
										/><circle
											class="text-primary"
											stroke="currentColor"
											stroke-width="2"
											fill="transparent"
											r="28"
											cx="30"
											cy="30"
											style="stroke-dasharray: 175.929, 175.929; transform: rotate(-90deg); transform-origin: 30px 30px;"
											transform-origin="30px 30px"
											stroke-dashoffset="175.92918860102841"
										/></svg
									>
								</div>
								<span style="transform: none;"
									><svg
										class="transform -rotate-90"
										width="32"
										height="32"
										viewBox="0 0 32 32"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										><path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M15.101 5.5V23.1094L9.40108 17.4095L8.14807 18.6619L15.9862 26.5L23.852 18.6342L22.5996 17.3817L16.8725 23.1094V5.5H15.101Z"
											fill="currentColor"
										/></svg
									></span
								>
							</div></button
						>
					</form>
				</div>
			</div>
		</div>
	</div>
</section>
