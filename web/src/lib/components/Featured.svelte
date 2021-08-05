<script>
	export let image;
	export let title;
	export let meta;
	export let description;
</script>

<section class="mt-12">
	<h2 class="leading-tight text-2xl md:text-3xl mb-3 dark:text-white">Featured</h2>
	<div
		class="relative flex items-center justify-center bg-white text-white overflow-hidden rounded-lg shadow-sm dark:bg-gray-800 focus:outline-none transition hover:ring-2 ring-yellow-50 ring-offset-2"
	>
		<div class="relative z-10 px-5 sm:text-left text-center py-10">
			<div
				class="space-y-5 mx-auto flex items-center justify-center max-w-screen-xl w-full sm:mb-4 md:my-12 lg:m-0 mt-0 mb-15"
			>
				<div
					class="flex lg:flex-row flex-col items-center justify-center sm:space-x-10 sm:space-y-0 space-y-5 0 w-full xl:pr-16"
				>
					<div class="col-span-1 max-w-lg">
						<img
							alt="Featured illustration"
							src={image}
							decoding="async"
							class="object-contain rounded-lg "
						/>
					</div>
					<div class="flex flex-col col-span-2 lg:items-start items-center w-full">
						<h1
							class="lg:text-3xl md:text-2xl sm:text-xl text-lg font-extrabold dark:text-white text-gray-800 leading-tight"
						>
							{title}
						</h1>
						<p class="my-4 font-medium opacity-75 font-body">{meta}</p>
						<div class="max-w-screen-md font-body">
							<p>
								{description}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
