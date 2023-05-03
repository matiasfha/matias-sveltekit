<script>
	import { onMount } from "svelte";


	let adsbygoogle = [{}];
	onMount(() => {
		if (window.adsbygoogle) {
			adsbygoogle = (window.adsbygoogle || []).push({});
		}
	});
    
</script>

<svelte:head>
	<script
		async
		src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8352667732450998"
		crossorigin="anonymous"
		defer
	></script>
	<script data-name="BMC-Widget" data-cfasync="true" src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js" data-id="matiasfha" data-description="Support me on Buy me a coffee!" data-message="Gracias por apoyar el contenido gratuito!" data-color="#FF5F5F" data-position="Right" data-x_margin="18" data-y_margin="18"></script>
</svelte:head>
<slot></slot>
