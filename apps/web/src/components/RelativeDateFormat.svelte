<script lang="ts">
	import { locale } from '$lib/translations';
	export let date: string;
	$: currentLocale = 'en';
	locale.subscribe((str) => {
		currentLocale = str;
	});
	const diffDate = new Date().getTime() - new Date(date).getTime();
	const diff = Math.floor(diffDate / (1000 * 60 * 60 * 24));
	$: rdf = new Intl.RelativeTimeFormat(currentLocale);
	$: displayDate = rdf.format(-diff, 'days');
</script>

{displayDate}
