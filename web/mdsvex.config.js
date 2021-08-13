import headings from "remark-autolink-headings";
import slug from "remark-slug";
import  highlight from 'remark-highlight.js';
import abbr from 'remark-abbr';
import urls from 'rehype-urls'
import autoLinkHeadings from 'rehype-autolink-headings'
import readingTime from "reading-time";
import jsYaml from 'js-yaml'
import visit from "unist-util-visit";

const MATTER_NODES = ['yaml', 'toml'];

function getReadingTime(options={}) {
	return function transform(ast, vFile){
		const stats = readingTime(vFile.contents)
		// Get frontmatter node from AST
		const frontMatterNode = ast.children.find(node => MATTER_NODES.includes(node.type));
		
		// parse current frontMatter 
		const newFm = {...jsYaml.safeLoad(frontMatterNode.value),...stats}
		frontMatterNode.value = newFm;
		
		return ast;
	}
}

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
  "extensions": [".md", '.mdx'],
  "layout": {
    blog: "./src/components/PostLayout.svelte",
  },
  "smartypants": {
    "dashes": "oldschool"
  },

  "remarkPlugins": [headings, slug, highlight, abbr],
  "rehypePlugins": [[urls, processUrl],[autoLinkHeadings, { behavior: 'wrap'}]]
};

export default config;