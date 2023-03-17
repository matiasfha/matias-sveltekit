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
	<script src="https://f.convertkit.com/ckjs/ck.5.js" type="text/partytown"></script>
	<script
		type="text/partytown"
		data-name="BMC-Widget"
		data-cfasync="false"
		src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
		data-id="matiasfha"
		data-description="Support me on Buy me a coffee!"
		data-message="If you find the content useful, would you like to invite me for coffee?Thanks for reading!"
		data-color="#5F7FFF"
		data-position="Right"
		data-x_margin="18"
		data-y_margin="18"
		async
		defer
	></script>
</svelte:head>
<slot></slot>
