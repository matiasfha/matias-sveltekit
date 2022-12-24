import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config/index.js';
import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-vercel';

import { mdsvexGlobalComponents } from './preprocessors/mdsvexGlobalComponents.js';

export const globalComponents = mdsvexGlobalComponents({
	dir: `$components/mdx`,
	list: [
		'Sponsor.svelte',
		'Buzzsprout.svelte',
		'CodeSandbox.svelte',
		'EggheadLesson.svelte',
		'TLDR.svelte',
		'Twitter.svelte',
		'Podcast.svelte',
		'YouTube.svelte',
		'Disclaimer.svelte',
		'StackBlitz.svelte'
	],
	extensions: mdsvexConfig.extensions
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],

	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessorssg
	preprocess: [
		preprocess({
			postcss: true,
			preserve: ['ld+json']
		}),
		globalComponents,
		mdsvex(mdsvexConfig)
	],

	kit: {
		// prerender: {
		//     enabled: true,
		//     crawl: true,
		//     entries: ["*"],
		//     handleHttpError: ({ status, path, referrer, referenceType, ...rest }) => {
		//         const error = Object.keys(rest).map(key => `${key}: ${rest[key]}`).join(', ')
		//         console.table(rest)
		//         console.error(
		//             `${status} ${path}${referrer ? ` (${referenceType} from ${referrer}) ${error}` : ''}`
		//         );
		//     }
		// },
		// adapter: netlify({
		//     edge: false,
		//     split: true,
		// }),
		adapter: adapter({
			edge: false,
			split: false
		})
	}
};

export default config;
