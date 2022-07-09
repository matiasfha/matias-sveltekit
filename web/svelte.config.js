import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js";
import preprocess from 'svelte-preprocess';
import netlify from '@sveltejs/adapter-netlify'
import path from 'path'
import { imagePreprocessor } from 'svelte-image-preprocessor-cloudinary';

import { mdsvexGlobalComponents } from  './preprocessors/mdsvexGlobalComponents.js'
import { similarPostsLoader } from './preprocessors/similarPosts.js'

const globalComponents = mdsvexGlobalComponents({
  dir: `$components/mdx`,
  list: ['Sponsor.svelte','Buzzsprout.svelte','CodeSandbox.svelte','EggheadLesson.svelte','TLDR.svelte','Twitter.svelte'],
  extensions: mdsvexConfig.extensions
})


/** @type {import('@sveltejs/kit').Config} */
const config = {
    experimental: {
        useVitePreprocess: true
    },
    extensions: [
        ".svelte",
        ...mdsvexConfig.extensions,
    ],

    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessorssg
    preprocess: [preprocess({
        "postcss": true
    }), globalComponents, similarPostsLoader(), mdsvex(mdsvexConfig), imagePreprocessor()],

    kit: {

        prerender: {
            enabled: true,
            onError: ({ status, path, referrer, referenceType, ...rest }) => {
                const error = Object.keys(rest).map(key => `${key}: ${rest[key]}`).join(', ')
                console.table(rest)
                console.error(
                    `${status} ${path}${referrer ? ` (${referenceType} from ${referrer}) ${error}` : ''}`
                );
                // if (path.startsWith('/blog')) {
                //     throw new Error('Missing a blog page!');
                // }
                
            }
        },
        adapter: netlify({
            edge: false,
            split: false,
        }),
        vite: {
            resolve: {
                alias: {
                    '$components': path.resolve('./src/components'),
                    '$api': path.resolve('./src/api'),
                    '$images': path.resolve('./src/images'),
                    '$utils': path.resolve('./src/lib/utils'),
                },
            }

        }
    },

};

export default config;
