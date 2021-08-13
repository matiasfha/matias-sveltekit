<script>
	export let lessonId;
</script>

<div class="egghead-lesson-mdx-embed">
	<iframe
		data-testid="egghead-lesson"
		title={`egghead-${lessonId}`}
		src={`https://egghead.io/lessons/${lessonId}/embed`}
		frameBorder="0"
		allow="autoplay; fullscreen"
		allowFullScreen
	/>
</div>

<style>
	div {
		position: relative;
		width: 100%;
		padding-top: 57%;
	}
	iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
