<script lang="ts">
	export let logo: string;
	export let title: string;
	export let description: string;
	export let formId: string;
	export let codeId: string;

	const onClick = () => {
		ml_account('webforms', formId, codeId, 'show');
	};
</script>

<svelte:head>
	<script>
		(function (m, a, i, l, e, r) {
			m['MailerLiteObject'] = e;
			function f() {
				var c = { a: arguments, q: [] };
				var r = this.push(c);
				return 'number' != typeof r ? r : f.bind(c.q);
			}
			f.q = f.q || [];
			m[e] = m[e] || f.bind(f.q);
			m[e].q = m[e].q || f.q;
			r = a.createElement(i);
			var _ = a.getElementsByTagName(i)[0];
			r.async = 1;
			r.src = l + '?v' + ~~(new Date().getTime() / 1000000);
			_.parentNode.insertBefore(r, _);
		})(window, document, 'script', 'https://static.mailerlite.com/js/universal.js', 'ml');

		var ml_account = ml('accounts', '3081949', 'x4j7h5e8a3', 'load');
	</script>
</svelte:head>

<div class="relative pt-12 w-full h-full">
	<img
		class="w-auto h-24 object-contain absolute left-4 top-10 z-10"
		alt="Illustration of a course Logo"
		src={logo}
	/>

	<div
		class="px-4 py-12 md:p-12 mt-14 md:mt-12 relative flex items-center justify-center bg-white dark:text-white  text-ebony-clay-800 overflow-hidden rounded-lg shadow-sm dark:bg-gray-800 focus:outline-none transition hover:ring-2 ring-yellow-50 ring-offset-2"
	>
		<div class="flex flex-col lg:items-start items-start md:items-center w-full">
			<h2
				class="lg:text-3xl md:text-2xl text-xl font-extrabold dark:text-white text-gray-800 leading-tight text-left"
			>
				{title}
			</h2>

			<div
				class="max-w-screen-md font-body text-left pt-8 prose dark:text-gray-300 text-ebony-clay-800"
			>
				{@html description}
			</div>

			<div class="w-full flex flex-col md:flex-row mt-12 gap-4 md:gap-16">
				<button
					on:click={onClick}
					class={`w-full h-14 
        bg-ebony-clay-600 
        dark:bg-gray-200 
        border-ebony-clay-600 
        dark:border-gray-200 
        text-gray-300 dark:text-ebony-clay-600
        relative inline-flex items-center justify-center p-4 px-8s py-3 overflow-hidden font-medium
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
			</div>
		</div>
	</div>
</div>
