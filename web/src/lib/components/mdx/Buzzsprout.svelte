<script>
	export let buzzsproutId;
</script>

<div style="position: relative">
	<iframe
		data-testid="buzzsprout"
		class="buzzsprout-mdx-embed"
		title={`buzzsprout-${buzzsproutId}`}
		src={`https://www.buzzsprout.com/1081172/${buzzsproutId}?client_source=admin&amp;iframe=true`}
		width="100%"
		height="200"
		frameBorder="0"
		scrolling="no"
	/>
</div>
