<script lang="ts">
	export let href: string;
	export let text: string;
	export let variant: 'primary' | 'secondary';
	export let onClick = () => null;

	const darkClasses = `bg-ebony-clay-600 
        dark:bg-gray-200 
        border-ebony-clay-600 
        dark:border-gray-200 
        text-gray-300 dark:text-ebony-clay-600`;
	const lightClasses = `dark:text-gray-100 text-ebony-clay-600 
					 border-ebony-clay-600 dark:border-gray-200`;
	const classes = variant === 'primary' ? darkClasses : lightClasses;
	const textClasses =
		variant === 'primary'
			? `dark:text-white text-ebony-clay-600
          dark:bg-ebony-clay-600 bg-gray-200`
			: `text-gray-100 dark:text-ebony-clay-600
						dark:bg-gray-100 bg-ebony-clay-600 `;
	const textClasses2 =
		variant === 'primary'
			? `text-gray-100 dark:text-ebony-clay-600 `
			: `dark:text-gray-100 text-ebony-clay-600 `;
</script>

<a
	{href}
	on:click={onClick}
	class={`w-full h-14 
        ${classes}
        relative inline-flex items-center justify-center p-4 px-8s py-3 overflow-hidden font-medium
        transition duration-300 ease-out border-2 
        rounded-full shadow-md group`}
>
	<span
		class={`absolute inset-0 flex items-center justify-center w-full h-full
          duration-300 -translate-x-full
           group-hover:translate-x-0 ease
           ${textClasses}`}
	>
		<svg
			class="w-8 h-6"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14 5l7 7m0 0l-7 7m7-7H3"
			/></svg
		>
	</span>
	<span
		class={`absolute flex items-center justify-center w-full h-full
         ${textClasses2} 
         transition-all duration-300 transform group-hover:translate-x-full ease`}>{text}</span
	>
	<span class="relative invisible">{text}</span>
</a>
