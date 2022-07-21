import headings from "remark-autolink-headings";
import slug from "remark-slug";
import highlight from 'remark-highlight.js';
import abbr from 'remark-abbr';
import urls from 'rehype-urls'
import autoLinkHeadings from 'rehype-autolink-headings'
import getReadingTime from "reading-time";
import { visit } from "unist-util-visit";
import { StringUtils } from 'turbocommons-ts';
import fs from 'fs'
import {globby} from 'globby'
import matter from 'gray-matter';

let memoizedPosts = new Map()
const getPosts = async () => {
	if(memoizedPosts.size === 0) {
		const files = await globby(["src/routes/blog/post/*.svx"]);
		for(const file of files) {
			const slug = file.match(/([\w-]+)\.(svelte\.md|md|svx)/i)?.[1] ?? null;
			memoizedPosts.set(slug, { slug, ...matter.read(file) })
		}
	}

	return Array.from(memoizedPosts.values())
}



const getSimilarPosts = async (filepath) => {
	const posts = await getPosts();
	const slug = filepath.match(/([\w-]+)\.(svelte\.md|md|svx)/i)?.[1] ?? null;
	const post = posts.find((p) => p.slug === slug);
	
	const map = new Map();
	posts.forEach((p) => {
		console.log('Checking similarity for', p.slug, 'with', slug)
		const similarity = StringUtils.compareByLevenshtein(
			String(p.content),
			String(post.content)
		);
		map.set(p.slug, {
			similarity,
			post: p
		});
		
	});

	const sorted = Array.from(map.values()).sort((a, b) => a.similarity - b.similarity);
	return sorted.map((p) => p.post).slice(0, 3);
}

	

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

function remarkSimilarPosts() {
	return async function(info, file) {
		file.data.fm['similarPosts'] = await getSimilarPosts(file.data.fm.filepath)
		
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

	"remarkPlugins": [remarkReadingTime,headings, slug, highlight, abbr, remarkSponsor, remmarkPath],
	"rehypePlugins": [[urls, processUrl], [autoLinkHeadings, { behavior: 'prepend' }]]
};

export default config;