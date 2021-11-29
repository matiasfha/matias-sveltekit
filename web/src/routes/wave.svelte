<script>
	import CtaButton from '$components/CtaButton.svelte';

	const wave = () => {};
</script>

<div class="grid grid-cols-1 items-center justify-center gap-16 mt-12">
	<h1 class="text-5xl dark:text-white mx-auto">Hola Mundo! 🌍</h1>
	<p class="text-xl dark:text-white">
		Esta pagina es parte de un mini proyecto para aprender crypto development con Ethereum
	</p>
	<CtaButton text="Envíame un crypto saludo 👋" on:click={wave} />
</div>
