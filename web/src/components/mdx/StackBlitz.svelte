<script lang="ts">
	import { browser } from "$app/environment";
    import {GenericEmbed} from "sveltekit-embed"
    export let title: string = ''
    export let id: string = ''
    export let view: 'editor' | 'preview' | 'default' = 'default'
    export let clickToLoad: boolean = true //ctl
    export let hideNavigation: boolean = true
    export let hideExplorer: boolean = false
    export let theme: string | 'light' | 'dark' | 'default' = 'dark'
    export let file: string | undefined

    let baseUrl = `https://stackblitz.com/edit/${id}?embed=1`
    const config = {
        ctl: `${clickToLoad ? 1 : 0}`,
        hideExplorer: `${hideExplorer ? 1 : 0}`,
        hideNavigation: `${hideNavigation ? 1: 0}`,
        theme
    }
    if(view !== 'default') {
        config['view'] = view 
    }
    if(file) {
        config['file'] = file
    }
    const queryString = new URLSearchParams(config)
    const src = `${baseUrl}&${queryString.toString()}`

    
</script>

{#if browser}
    <GenericEmbed {src} {title} {id} />
{:else}
    <div />
{/if}