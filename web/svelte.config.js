import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js";
import preprocess from 'svelte-preprocess';
import netlify from '@sveltejs/adapter-netlify'
import path from 'path'


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
                    import getSimilarPosts from "$api/getSimilarPosts"
                    /** @type {import('./__types/[slug]').Load} */
                    export async function load({params, fetch, url, session, stuff}) {
                        try {
                            const { pathname } = url
                            const similarPosts = await getSimilarPosts(pathname)
                            
                            return {
                                props: {
                                    similarPosts
                                }
                            }			
                        }catch(e) {
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
    }), globalComponents, similarPostsLoader(), mdsvex(mdsvexConfig)],

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
        adapter: netlify({
            edge: false,
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
