

import urls from 'rehype-urls'
import autoLinkHeadings from 'rehype-autolink-headings'
import 'dotenv/config'
import { highlighterFn } from './highlighterFn.js';
import { cloudinaryImages } from './cloudinaryImages.js';
import { remarkReadingTime } from './remarkReadingTime.js';
import { remmarkPath } from './remmarkPath.js';
import { remarkSponsor } from './remarkSponsor.js';
import { processUrl } from './processUrl.js';
import { setDefaultLang } from './setDefaultLang.js';

/**
 * @type { import('mdsvex').MdsvexOptions}
 */
const config = {
	"extensions": [".svx"],
	"layout": {
		blog: "./src/components/PostLayout.svelte",
		pages: "./src/components/PageLayout.svelte",
		sponsor: "./src/components/SponsorLayout.svelte",
	},
	// "smartypants": {
	// 	"dashes": "oldschool"
	// },
	highlight: {
		highlighter: highlighterFn
	},

	"remarkPlugins": [remarkReadingTime, remarkSponsor, remmarkPath, cloudinaryImages, setDefaultLang],
	"rehypePlugins": [[urls, processUrl],  [autoLinkHeadings, { behavior: 'wrap' }]]
};

export default config