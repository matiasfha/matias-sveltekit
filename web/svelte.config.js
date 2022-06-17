import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js";
import preprocess from 'svelte-preprocess';
import netlify from '@sveltejs/adapter-netlify'
import path from 'path'
/** @type {import('@sveltejs/kit').Config} */
const config = {
    experimental: {
        useVitePreprocess: true
    },
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
        prerender: {
            enabled: true,
            onError: ({ status, path, referrer, referenceType }) => {
                if (path.startsWith('/blog')) throw new Error('Missing a blog page!');
                console.warn(
                    `${status} ${path}${referrer ? ` (${referenceType} from ${referrer})` : ''}`
                );
            }
        },
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

        }
    },

};

export default config;
