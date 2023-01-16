<script lang="ts">
    import { locale } from '$lib/translations';
    export let date: string
    const diffDate = new Date().getTime() - new Date(date).getTime()
    const diff = Math.floor(diffDate / (1000*60*60*24))
    $: rdf = new Intl.RelativeTimeFormat(locale.get())
    let unit: Intl.RelativeTimeFormatUnit = 'day' 
    let value = diff
    if(diff > 30){
        unit = 'month'
        value = Math.floor(diff/30)
    }
    if(diff > 365) {
        unit = 'year'
        value = Math.floor(diff/365)
    }
    $: displayDate = rdf.format(-value, unit)
</script>

{displayDate}
