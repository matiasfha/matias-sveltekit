<script context="module">
	export async function load({ fetch }) {
		const url = '/api/cafecontech.json';
		const res = await fetch(url);
		if (res.ok) {
			const episodes = await res.json();
			return {
				props: {
					cafeConTech: {
						episodes,
						latest: episodes[0]
					}
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script>

<script>
	import Hero from '$lib/components/Hero.svelte';
	import Featured from '$lib/components/Featured.svelte';
	import microbytes from '$lib/images/microbytes.png';
	export let cafeConTech;
</script>

<Hero />

<Featured
	image="https://escuelafrontend.com/_next/image?url=%2Fimages%2Freact-icon-hero.svg&w=256&q=100"
	title="React useEffect ¿Por que el arreglo de dependencias es importante?"
	meta="Workshop · Sábado 7 de Agosto, 2021"
	description="En este workshop, aprenderás los fundamentos esenciales para empezar tu carrera profesional como un React developer. Cuando hayas terminado, tendrás los fundamentos 	esenciales para crear experiencias excelentes para los usuarios de tus aplicaciones."
/>

<!-- Latest -->
<section class="mt-24">
	<h2 class="leading-tight text-2xl md:text-3xl mb-3 dark:text-white">Latest</h2>
	<div class="grid md:grid-cols-2 grid-cols-1 md:gap-16 gap-8">
		<div class="flex flex-col">
			<div class="md:mb-4 mb-2">
				<a
					class="group peer relative block w-full focus:outline-none"
					href="/blog/useeffect-vs-uselayouteffect"
					><div
						class="aspect-w-2 aspect-h-1 focus:ring w-full rounded-lg transition group-hover:ring-2 ring-yellow-50 ring-offset-2"
					>
						<img
							alt="podcast"
							class="rounded-lg object-cover"
							src="https://matiashernandez.dev/static/ac0c22c494eadef3f1fc51305ceb9825/f3dec/hooks-3d62.png"
						/>
					</div>

					<div class="mt-8 text-gray-300 text-md font-medium lowercase text-body">Course</div>
					<div class="text-2xl font-medium md:text-3xl text-black dark:text-white mt-4">
						Construye Componentes Avanzados con React Hooks y Patrones de Diseño
					</div></a
				>
			</div>
		</div>
		<div class="flex flex-col">
			<div class="md:mb-4 mb-2">
				<a
					class="group peer relative block w-full focus:outline-none"
					href="/blog/useeffect-vs-uselayouteffect"
					><div
						class="aspect-w-2 aspect-h-1 focus:ring w-full rounded-lg transition group-hover:ring-2 ring-yellow-50 ring-offset-2"
					>
						<img
							alt="podcast"
							class="rounded-lg object-cover"
							src={cafeConTech.latest.itunes.image}
						/>
					</div>

					<div class="mt-8 text-gray-300 text-md font-medium lowercase text-body">
						{new Date(cafeConTech.latest.isoDate).toDateString()}
					</div>
					<div class="text-2xl font-medium md:text-3xl text-black dark:text-white mt-4">
						{cafeConTech.latest.title}
					</div></a
				>
			</div>
		</div>
		<div class="flex flex-col">
			<div class="md:mb-4 mb-2">
				<a
					class="group peer relative block w-full focus:outline-none"
					href="https://h.matiashernandez.dev/4-habilidades-blandas-esenciales-para-un-desarrollador"
					><div
						class="aspect-w-2 aspect-h-1 focus:ring w-full rounded-lg transition group-hover:ring-2 ring-yellow-50 ring-offset-2"
					>
						<img
							alt="Fijando expectativas"
							class="rounded-lg object-cover"
							src="https://h.matiashernandez.dev/_next/image?url=https%3A%2F%2Fcdn.hashnode.com%2Fres%2Fhashnode%2Fimage%2Fupload%2Fv1620052739335%2FRyzHtZtdH.jpeg%3Fw%3D1600%26h%3D840%26fit%3Dcrop%26crop%3Dentropy%26auto%3Dcompress%2Cformat%26format%3Dwebp&w=3840&q=75"
						/>
					</div>
					<div class="mt-8 text-gray-300 text-md font-medium lowercase text-body">
						03 de Mayo, 2021
					</div>
					<div class="text-2xl font-medium md:text-3xl text-black dark:text-white mt-4">
						4 Habilidades Blandas Esenciales Para Un Desarrollador.
					</div></a
				>
			</div>
		</div>
		<div class="flex flex-col">
			<div class="md:mb-4 mb-2">
				<a
					class="group peer relative block w-full focus:outline-none"
					href="https://clevertech.biz/insights/why-we-choose-typescript-all-the-way-through"
					><div
						class="aspect-w-2 aspect-h-1 focus:ring w-full rounded-lg transition group-hover:ring-2 ring-yellow-50 ring-offset-2"
					>
						<img
							alt="Typescript article"
							class="rounded-lg object-cover"
							src="https://clevertech-projectid-prod.s3.amazonaws.com/media/slack_imgs_599094f762.jpg"
						/>
					</div>
					<div class="mt-8 text-gray-300 text-md font-medium lowercase text-body" />
					<div class="text-2xl font-medium md:text-3xl text-black dark:text-white mt-4">
						Why we choose Typescript all the way through
					</div></a
				>
			</div>
		</div>
	</div>
</section>

<!-- Favorites-->
<section class="mt-24">
	<h2 class="text-xl sm:font-semibold font-bold mb-3 dark:text-white">Staff Picks and Favorites</h2>
	<div class="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-4">
		<div
			class="bg-white dark:bg-gray-800 dark:text-gray-200 shadow-sm rounded-lg overflow-hidden p-5 text-center hover:ring-2 ring-yellow-50 ring-offset-2"
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
		class="relative flex items-center justify-center bg-white text-white overflow-hidden rounded-lg shadow-sm dark:bg-gray-800 focus:outline-none transition hover:ring-2 ring-yellow-50 ring-offset-2"
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
