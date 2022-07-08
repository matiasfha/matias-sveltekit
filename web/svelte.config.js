import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js";
import preprocess from 'svelte-preprocess';
import vercel from '@sveltejs/adapter-vercel'
import path from 'path'
import { imagePreprocessor } from 'svelte-image-preprocessor-cloudinary';

import { mdsvexGlobalComponents } from  './mdsvexGlobalComponents.js'

const similarPostsLoader = () => {
    
    const preprocessor = {
        script(thing) {
            const { content, filename, markup, attributes } = thing
            if (!filename.match(/\.svx$/)) {
                return { code: content }
            }
            if(!filename.match(/\/blog\/.*\.svx$/)) {
                return { code: content }
            }
            const hasModuleContext = /^<script context="module">/.test(markup)
            const isModulePass = attributes?.context === 'module'
            const isValidPass = (hasModuleContext && isModulePass) || !hasModuleContext
            if (!isValidPass) {
              return { code: content }
            }
            return {
                code: `
                    export const hydrate = false
                    export const prerender = true;
                    import getSimilarPosts from "$api/getSimilarPosts"
                    /** @type {import('./__types/[slug]').Load} */
                    export async function load({url}) {
                        try {
                            const { pathname } = url
                            const similarPosts = await getSimilarPosts(pathname)
                            
                            return {
                                props: {
                                    similarPosts
                                }
                            }			
                        }catch(e) {
                            console.error(e)
                            return {
                                status: 500,
                                error: e
                            }
                        }
                    }
                \n${content}
                `
            }
        }
    }
    return preprocessor
}

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
        adapter: vercel({
            edge: true,
            split: true,
        }),
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
