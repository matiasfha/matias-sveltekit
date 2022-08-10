import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js";
import preprocess from 'svelte-preprocess';
import netlify from '@sveltejs/adapter-netlify'

import { mdsvexGlobalComponents } from  './preprocessors/mdsvexGlobalComponents.js'
import { similarPostsLoader } from './preprocessors/similarPosts.js'

const globalComponents = mdsvexGlobalComponents({
  dir: `$components/mdx`,
  list: ['Sponsor.svelte','Buzzsprout.svelte','CodeSandbox.svelte','EggheadLesson.svelte','TLDR.svelte','Twitter.svelte','Podcast.svelte','YouTube.svelte'],
  extensions: mdsvexConfig.extensions
})

/** @type {import('@sveltejs/kit').Config} */
const config = {
    extensions: [
        ".svelte",
        ...mdsvexConfig.extensions,
    ],

    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessorssg
    preprocess: [preprocess({
        "postcss": true,
        preserve: ['partytown']
    }), globalComponents, mdsvex(mdsvexConfig),similarPostsLoader()],

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
            split: true,
        }),
    },

};

export default config;
