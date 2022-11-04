<script lang="ts">
	
	import { t } from '$lib/translations';

</script>

<section class="font-body pt-8  dark:text-white text-center">
	<p>
		{$t('common.newsletter_text')}
	</p>
	<form class="flex flex-col md:flex-row gap-4 justify-between mx-auto mt-4 p-8 prose prose-lg items-center" action="https://static.mailerlite.com/webforms/submit/c4r8t8" data-code="c4r8t8" method="post" target="_blank">
		<input type="hidden" name="ml-submit" value="1">
		<input type="hidden" name="anticsrf" value="true">
		<input type="text" name="fields[email]" placeholder="Tu email" 
        class="px-4 font-medium rounded-md show-md w-full md:w-80 shadow-md" autocomplete="email"/>
		<button
		type="submit"
			class={`h-8 w-full md:w-52 
bg-ebony-clay-600 
dark:bg-gray-200 
border-ebony-clay-600 
dark:border-gray-200 
text-gray-300 dark:text-ebony-clay-600
relative inline-flex items-center justify-center py-3 overflow-hidden font-medium
transition duration-300 ease-out border-2 
rounded-full shadow-md group`}
		>
			<span
				class={`absolute inset-0 flex items-center justify-center w-full h-full
  duration-300 -translate-x-full
   group-hover:translate-x-0 ease
   dark:text-white text-ebony-clay-600
  dark:bg-ebony-clay-600 bg-gray-200`}
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
 text-gray-100 dark:text-ebony-clay-600  
 transition-all duration-300 transform group-hover:translate-x-full ease`}>Únete hoy</span
			>
			<span class="relative invisible">Únete hoy</span>
		</button>
	</form>
</section>