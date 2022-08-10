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

import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config'

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	secure: true
});

async function uploadImage(imagePath, withLogo = false) {
	/**
	 * @type {import('cloudinary/types/index').UploadApiOptions}'}
	 */
	let cloudinaryOptions = {
		use_filename: true,
		unique_filename: false,
		overwrite: true,
		resource_type: 'image',
	};
	if(withLogo) {
		cloudinaryOptions['transformation'] = [
			{overlay: 'logo',width: 400 ,x: '300',y: '100', gravity: 'north_east'},
			{flag: 'layer_apply',}
		]
	}
	
	try {
		// Upload the image
		return await cloudinary.uploader.upload(imagePath, cloudinaryOptions);
		
	} catch (error) {
		console.error(error);
	}
}

function cloudinaryImages() {
	/**
	 * @param {Node} node
	 */
	return async function transformer(tree, vFile) {
		if(vFile.data.fm.banner) {
			const image = vFile.data.fm.banner
			if(!image.includes('https://res.cloudinary.com')) {
				const { url} = await uploadImage(image,)
				vFile.data.fm['banner'] = url
			}
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

	"remarkPlugins": [remarkReadingTime, headings, slug, highlight, abbr, remarkSponsor, remmarkPath, cloudinaryImages],
	"rehypePlugins": [[urls, processUrl],  [autoLinkHeadings, { behavior: 'prepend' }]]
};

export default config