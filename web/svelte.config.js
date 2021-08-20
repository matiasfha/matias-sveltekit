import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js";
import preprocess from 'svelte-preprocess';
import netlify from '@sveltejs/adapter-netlify'
import path from 'path'
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
        adapter: netlify(),
        // hydrate the <div id="svelte"> element in src/app.html
        target: '#svelte',
        vite: {
            resolve: {
                alias: {
                    '$components': path.resolve('./src/components'),
                    '$api': path.resolve('./src/api'),
                    '$images': path.resolve('./src/images'),
                    '$utils': path.resolve('./src/lib/utils')
                }
            },
            optimizeDeps: {
                exclude: ['svelte-modals']
            }
        }    
    },
    
};

export default config;
