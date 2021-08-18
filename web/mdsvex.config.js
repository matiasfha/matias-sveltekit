import headings from "remark-autolink-headings";
import slug from "remark-slug";
import  highlight from 'remark-highlight.js';
import abbr from 'remark-abbr';
import urls from 'rehype-urls'
import autoLinkHeadings from 'rehype-autolink-headings'


function processUrl(url, node) {
	if (node.tagName === "a") {
		node.properties.class = "text-link"

		if (!url.href.startsWith("/")) {
			// Open external links in new tab
			node.properties.target = "_blank"
			// Fix a security concern with offsite links
			// See: https://web.dev/external-anchors-use-rel-noopener/
			node.properties.rel = "noopener"
		}
	}
}

const config = {
  "extensions": [".svx"],
  "layout": {
    blog: "./src/components/PostLayout.svelte",
	pages: "./src/components/PageLayout.svelte",
  },
  "smartypants": {
    "dashes": "oldschool"
  },

  "remarkPlugins": [headings, slug, highlight, abbr],
  "rehypePlugins": [[urls, processUrl],[autoLinkHeadings, { behavior: 'wrap'}]]
};

export default config;