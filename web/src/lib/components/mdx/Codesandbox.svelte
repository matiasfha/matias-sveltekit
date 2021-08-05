<script>
	export let codeSandboxId;
</script>

<iframe
	data-testid="codesandbox"
	title={`codeSandbox-${codeSandboxId}`}
	class="codesandbox-mdx-embed"
	src={`https://codesandbox.io/embed/${codeSandboxId}`}
	allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
	sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
/>

<style>
	iframe {
		width: 100%;
		height: 500px;
		border: 0;
		border-radius: 4px;
		overflow: hidden;
	}
</style>
