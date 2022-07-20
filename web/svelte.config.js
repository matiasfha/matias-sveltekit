import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js";
import preprocess from 'svelte-preprocess';
import netlify from '@sveltejs/adapter-netlify'

import { mdsvexGlobalComponents } from  './preprocessors/mdsvexGlobalComponents.js'
import { similarPostsLoader } from './preprocessors/similarPosts.js'

const globalComponents = mdsvexGlobalComponents({
  dir: `$components/mdx`,
  list: ['Sponsor.svelte','Buzzsprout.svelte','CodeSandbox.svelte','EggheadLesson.svelte','TLDR.svelte','Twitter.svelte','Podcast.svelte'],
  extensions: mdsvexConfig.extensions
})

const rootDomain = process.env.VITE_DOMAIN; // or your server IP for dev
 
 const cspDirectives = {
   'base-uri': ["'self'"],
   'child-src': ["'self'"],
   'connect-src': ["'self'", 'ws://localhost:*'],
   // 'connect-src': ["'self'", 'ws://localhost:*', 'https://hcaptcha.com', 'https://*.hcaptcha.com'],
   'img-src': ["'self'", 'data:'],
   'font-src': ["'self'", 'data:'],
   'form-action': ["'self'"],
   'frame-ancestors': ["'self'"],
   'frame-src': [
     "'self'",
     // "https://*.stripe.com",
     // "https://*.facebook.com",
     // "https://*.facebook.net",
     // 'https://hcaptcha.com',
     // 'https://*.hcaptcha.com',
   ],
   'manifest-src': ["'self'"],
   'media-src': ["'self'", 'data:'],
   'object-src': ["'none'"],
   'style-src': ["'self'", "'unsafe-inline'"],
   // 'style-src': ["'self'", "'unsafe-inline'", 'https://hcaptcha.com', 'https://*.hcaptcha.com'],
   'default-src': [
     'self',
     ...(rootDomain ? [rootDomain, `ws://${rootDomain}`] : []),
     // 'https://*.google.com',
     // 'https://*.googleapis.com',
     // 'https://*.firebase.com',
     // 'https://*.gstatic.com',
     // 'https://*.cloudfunctions.net',
     // 'https://*.algolia.net',
     // 'https://*.facebook.com',
     // 'https://*.facebook.net',
     // 'https://*.stripe.com',
     // 'https://*.sentry.io',
   ],
   'script-src': [
     'self',
     // 'https://*.stripe.com',
     // 'https://*.facebook.com',
     // 'https://*.facebook.net',
     // 'https://hcaptcha.com',
     // 'https://*.hcaptcha.com',
     // 'https://*.sentry.io',
     // 'https://polyfill.io',
   ],
   'worker-src': ["'self'"],
 };

/** @type {import('@sveltejs/kit').Config} */
const config = {
    extensions: [
        ".svelte",
        ...mdsvexConfig.extensions,
    ],

    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessorssg
    preprocess: [preprocess({
        "postcss": true
    }), globalComponents, similarPostsLoader(), mdsvex(mdsvexConfig)],

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
