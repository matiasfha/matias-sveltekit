<script lang="ts">
    import { fade } from "svelte/transition";

    // Props
    export let src: string 
    export let alt: string = "Post image"
    export let width: string = undefined
    export let height: string = "100%"
    export let id: string = undefined 
    export let classes: string = undefined
    export let style: string = undefined
    
    
    // State
    $: imageReady = false

    
    let options = {
        root: null,
        rootMargin: "0px",
        threshold: 0
    }

    export const lazyLoad = (image, src) => {                       // receieves the img node and the src string
        const loaded = () => {
            imageReady = true 
            
        }
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                image.src = src                                     // replace placeholder src with the image src on observe
                if (image.complete) {                               // check if instantly loaded
                    loaded()        
                } else {
                    image.addEventListener('load', loaded)          // if the image isn't loaded yet, add an event listener
                }
            }
        }, options)
        observer.observe(image)                                     // intersection observer

        return {
            destroy() {
                image.removeEventListener('load', loaded)           // clean up the event listener
            }
        }
    }
    
    
</script>


<img use:lazyLoad={src} {alt} class={`${classes} ${imageReady ? 'opacity-100' : 'opacity-0'} transition-opacity`} {id} {width} {height}  decoding="async" loading="lazy" transition:fade={{ duration: 2000 }} />

