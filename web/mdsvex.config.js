import headings from "remark-autolink-headings";
import slug from "remark-slug";
import highlight from 'remark-highlight.js';
import abbr from 'remark-abbr';
import urls from 'rehype-urls'
import autoLinkHeadings from 'rehype-autolink-headings'
import getReadingTime from "reading-time";
import { visit } from "unist-util-visit";



function processUrl(url, node) {
	if (node.tagName === "a") {
		node.properties.class = node.properties.class + " underlined"

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
		if(file.filename.includes('blog')) {
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
			if(node.children.length > 60) {
				node.children = [
					...node.children.slice(0, node.children.length),
					{
						type: 'html',
						value: '<Sponsor /> ',
			
					},
				]		
			}	
		}
		
		
	}
}

import path from 'path'

function remmarkPath() {
	return async function transformer(tree, vFile) {
		const filepath = path.relative('__dirname',vFile.filename).replace(/^(.){2}/, '')
		if(!vFile.data.fm) {
			vFile.data.fm = {}
		}
		
		vFile.data.fm.filepath = filepath
		const slug = filepath.match(/([\w-]+)\.(svelte\.md|md|svx)/i)?.[1]
		vFile.data.fm.canonical = `https://matiashernandez.dev/blog/post/${slug}`	
	}
}

function remarkReadingTime() {
	return async function(info, file) {
		let text  = "";
		visit(info, ["text","code"], (node) => {
			text += node.value
		})
		file.data.fm['readingTime'] = getReadingTime(text)
		
	}
}
/** 
* @typedef {import('unist').Node} Node
* @typedef {import('unified').Transformer} Transformer 
* @typedef { {
		type: "element";
		tagName: string;
		properties: {
			[prop: string]: string | undefined;
		};
		children?: Node[];
	} 
} HtmlBaseElementNode
* @typedef { HtmlBaseElementNode & Node } HtmlElementNode
*/
/**
 * Returns the `<articke>` node.
 * The second node returned is the parent of the first node.
 * @param {Node} node
 * @returns {[HtmlElementNode, HtmlElementNode]}
 */
 export function findArticleNode(root) {
	let [body, bodyParent] = findTagName(root, "body");
	let [article, articleParent] = findTagName(root, "article");
  
	if (article) {
	  return [article, articleParent || root];
	}
	else {
	  return [
		body || root ,
		bodyParent || root
	  ];
	}
  }

  /**
 * Recursively crawls the HAST tree and finds the first element with the specified tag name.
 * @param {Node} node
 * @param {string} tagName
 * @returns [[HtmlElementNode | undefined, HtmlElementNode | undefined]]
 */
function findTagName(node, tagName) {
	if (isHtmlElementNode(node) && node.tagName === tagName) {
	  return [node, undefined];
	}
  
	if (node.children) {
	  let parent = node;
	  for (let child of parent.children) {
		let [found] = findTagName(child, tagName);
		if (found) {
		  return [found, parent];
		}
	  }
	}
  
	return [undefined, undefined];
  }


function toc() {
	/**
	 * @param {Node} node
	 */
	return function transformer(root) {
		// Find the <article node
		let [articleNode, articleParent] = findArticleNode(root);
		let headings = findHeadings(articleNode);
		console.log(headings)
		return root

	}
}

/**
 * @typdef {import('unist').Parent} Parent
 * @typedef {"h1" | "h2" | "h3" | "h4" | "h5" | "h6" } HeadingTagName
 * @typedef { HtmlElementNode & { tagName: HeadingTagName } } HeadingNode
 */

/**
 * Finds all HTML heading nodes (`<h1>` through `<h6>`)
 * @params {Parent} Node
 * @returns {HeadingNode[]}
 */
export function findHeadings(node) {
  let headingNodes = [];
  findHeadingsRecursive(node, headingNodes);
  return headingNodes;
}
/**
 * 
 * @param {Node} node 
 * @returns {node is HtmlBaseElementNode}
 */
function isHtmlElementNode(node) {
	return typeof node === "object" &&
	  node.type === "element" &&
	  typeof node.tagName === "string" &&
	  "properties" in node &&
	  typeof node.properties === "object";
  }
/**
 * 
 * @param {Node} node 
 * @returns { node is HeadingNode}
 */
function isHeadingNode(node) {
	return isHtmlElementNode(node) && ["h1", "h2", "h3", "h4", "h5", "h6"].includes(/** @type {HeadingTagName} */(node.tagName));
  }
/**
 * Recursively crawls the HAST tree and adds all HTML heading nodes to the given array.
 * @params {Node} node
 * @params {HeadingNode[]} headingNodes
 */
function findHeadingsRecursive(node,headingNodes) {
  if (isHeadingNode(node)) {
    headingNodes.push(node);
  }

  if (node.children) {
    let parent = node;
    for (let child of parent.children) {
      findHeadingsRecursive(child, headingNodes);
    }
  }
}

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
	"smartypants": {
		"dashes": "oldschool"
	},

	"remarkPlugins": [remarkReadingTime, headings, slug, highlight, abbr, remarkSponsor, remmarkPath],
	"rehypePlugins": [[urls, processUrl],  [autoLinkHeadings, { behavior: 'prepend' }], toc]
};

export default config