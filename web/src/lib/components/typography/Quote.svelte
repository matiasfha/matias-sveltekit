<aside
	class="text-lg border-l-4 border-blue-600 rounded italic bg-ebony-clay-600 text-gray-200 relative mt-4 mb-8 py-4 px-8"
>
	<div
		class="text-blue-600 absolute top-0 left-0
  transform -translate-y-2/4 -translate-x-2/4
  rounded-full
  bg-blue-50
  p-2"
	>
		<i fill="currentColor">
			<svg
				fill="none"
				height="32"
				width="32"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="16" x2="12" y2="12" />
				<line x1="12" y1="8" x2="12" y2="8" />
			</svg>
		</i>
	</div>
	<div>
		<slot />
	</div>
</aside>

<style>
	i,
	svg {
		display: inline-block;
	}
	svg {
		vertical-align: middle;
	}
</style>
