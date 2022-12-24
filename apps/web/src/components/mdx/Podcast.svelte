<script>
	export let episode;
</script>

<div style="position: relative">
	<iframe
		data-testid="buzzsprout"
		class="buzzsprout-mdx-embed"
		title={`cafecontech-${episode}`}
		src={`https://anchor.fm/cafecontech/embed/episodes/${episode}`}
		width="100%"
		height="200"
		frameBorder="0"
		scrolling="no"
	/>
</div>
