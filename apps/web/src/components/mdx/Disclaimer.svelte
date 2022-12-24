<script lang="ts">
	export let title = '';
</script>

<aside
	class="text-lg border-l-4 rounded-3xl border-orange-800 italic transparent dark:text-gray-200 text-ebony-clay-600 relative mt-4 mb-8"
>
	<div
		class="text-orange-800 absolute top-0 left-0
  transform -translate-y-2/4 -translate-x-2/4
  rounded-full
  dark:bg-ebony-clay-600 bg-gray-100  p-2"
	>
		<i fill="currentColor">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="32"
				height="32"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path
					d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
				/><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg
			>
		</i>
	</div>
	<div class="relative p-8 pt-2 pb-10">
		<div
			class="absolute top-0 right-0 bg-yellow-300 dark:bg-orange-800 w-full h-full -z-10 opacity-50"
		/>
		<p><strong class="text-orange-800">{title}</strong></p>
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
