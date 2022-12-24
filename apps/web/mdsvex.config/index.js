import urls from 'rehype-urls';
import 'dotenv/config';
import { highlighterFn } from './highlighterFn.js';
import { cloudinaryImages } from './cloudinaryImages.js';
import { remarkReadingTime } from './remarkReadingTime.js';
import { remmarkPath } from './remmarkPath.js';
import { remarkSponsor } from './remarkSponsor.js';
import { processUrl } from './processUrl.js';
import { setDefaultLang } from './setDefaultLang.js';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import slug from '@microflash/rehype-slugify';
import Slugger from 'github-slugger';
import jsyaml from 'js-yaml';
const slugger = new Slugger();

export function fmToc() {
	slugger.reset();
	return async function (node, vFile) {
		let toc = [];
		visit(node, ['heading'], (node) => {
			if (node.depth <= 3) {
				const value = toString(node, { includeImageAlt: false });
				const slug = slugger.slug(value);
				toc.push({ slug, value });
			}
		});
		if (!vFile.data.fm) {
			vFile.data.fm = {};
		}
		if (!vFile.data.fm.toc) {
			vFile.data.fm.toc = jsyaml.dump(JSON.stringify(toc));
		}
	};
}

/**
 * @type { import('mdsvex').MdsvexOptions}
 */
const config = {
	extensions: ['.svx'],
	layout: {
		blog: './src/components/PostLayout.svelte',
		pages: './src/components/PageLayout.svelte',
		sponsor: './src/components/SponsorLayout.svelte'
	},
	// "smartypants": {
	// 	"dashes": "oldschool"
	// },
	highlight: {
		highlighter: highlighterFn
	},

	remarkPlugins: [
		remarkReadingTime,
		remarkSponsor,
		remmarkPath,
		cloudinaryImages,
		setDefaultLang,
		fmToc
	],
	rehypePlugins: [
		[urls, processUrl],
		[
			slug,
			{
				reset() {
					slugger.reset();
				},
				slugify(text) {
					return slugger.slug(text);
				}
			}
		]
	]
};

export default config;
