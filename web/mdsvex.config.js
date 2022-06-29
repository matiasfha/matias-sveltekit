import headings from "remark-autolink-headings";
import slug from "remark-slug";
import highlight from 'remark-highlight.js';
import abbr from 'remark-abbr';
import urls from 'rehype-urls'
import autoLinkHeadings from 'rehype-autolink-headings'


function processUrl(url, node) {
	if (node.tagName === "a") {
		node.properties.class = "underlined"

		if (!url.href.startsWith("/")) {
			// Open external links in new tab
			node.properties.target = "_blank"
			// Fix a security concern with offsite links
			// See: https://web.dev/external-anchors-use-rel-noopener/
			node.properties.rel = "noopener"
		}
	}
}

function remarkSponsor() {
	return (node,file) => {
		if(file.filename.includes('sponsorships.svx')) {
			return node
		}
		node.children = [
			...node.children.slice(0, 6),
			{
				type: 'html',
				value: '<Sponsor /> ',
	
			},
			...node.children.slice(6)
		]

		if(node.children.length > 30) {
			node.children = [
				...node.children.slice(0, 30),
				{
					type: 'html',
					value: '<Sponsor /> ',
		
				},
				...node.children.slice(30)
			]	
		}
		
	}
}

import path from 'path'

function remmarkPath() {
	return function transformer(tree, vFile) {
		const filepath = path.relative('__dirname',vFile.filename).replace(/^(.){2}/, '')
		if(!vFile.data.fm) {
			vFile.data.fm = {}
		}
		vFile.data.fm.filepath = filepath
		
		
	}
}

const config = {
	"extensions": [".svx"],
	"layout": {
		blog: "./src/components/PostLayout.svelte",
		pages: "./src/components/PageLayout.svelte",
		sponsor: "./src/components/SponsorLayout.svelte",
	},
	"smartypants": {
		"dashes": "oldschool"
	},

	"remarkPlugins": [headings, slug, highlight, abbr, remarkSponsor, remmarkPath],
	"rehypePlugins": [[urls, processUrl], [autoLinkHeadings, { behavior: 'prepend' }]]
};

export default config;