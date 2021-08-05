import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js";
import preprocess from 'svelte-preprocess';
import vercel from 'svelte-adapter'

/** @type {import('@sveltejs/kit').Config} */
const config = {
    "extensions": [
        ".svelte",
        ...mdsvexConfig.extensions,
    ],
    
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: [preprocess({
        "postcss": true
    }), mdsvex(mdsvexConfig)],

    kit: {
        adapter: vercel(),
        // hydrate the <div id="svelte"> element in src/app.html
        target: '#svelte',
        
      }
};

export default config;
