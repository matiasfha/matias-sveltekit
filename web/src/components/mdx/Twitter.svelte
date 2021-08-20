<script>
	import { afterUpdate, onMount } from 'svelte';
	const url = 'https://publish.twitter.com/oembed';

	export let id = '515490786800963584';
	afterUpdate(() => {
		var tweet = document.getElementById('tweet');
		window.twttr.widgets
			.createTweet(id, tweet, {
				conversation: 'none', // or all
				cards: 'hidden', // or visible
				linkColor: '#cc0000', // default is blue
				theme: 'light' // or dark
			})
			.then(function (el) {
				el.contentDocument.querySelector('.footer').style.display = 'none';
			});
	});
</script>

<svelte:head>
	<script async src="https://platform.twitter.com/widgets.js"></script>
</svelte:head>

<div id="tweet" class="mx-auto my-0 md:w-[550px]" />
