
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
			{effect: "auto_contrast", gravity: "south_west", overlay: {font_family: "montserrat", font_size: 30, text: "%40matiasfha"}, x: 20, y: 10},
			{overlay: 'logo',width: 400 ,x: '300',y: '100', gravity: 'north_east'},
			{flag: 'layer_apply',},
			
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
				const { secure_url} = await uploadImage(image,)
				vFile.data.fm['banner'] = secure_url
			}
		}
		

	}
}

import Prism from 'prismjs'
import loadLanguages from 'prismjs/components/index.js';
loadLanguages(['typescript','java','bash'])
import escape from 'escape-html';
// escape curlies, backtick, \t, \r, \n to avoid breaking output of {@html `here`} in .svelte
const escape_svelty = (str)  =>
	str
		.replace(
			/[{}`]/g,
			(c) => ({ '{': '&#123;', '}': '&#125;', '`': '&#96;' }[c])
		)
		.replace(/\\([trn])/g, '&#92;$1');

 /**
  * @param code {string} - code to highlight
  * @param lang {string} - code language
  * @param meta {string} - code meta
  * @returns {Promise<string>} - highlighted html
  */
function highlighterFn(code, lang = 'js', meta) {
	
	let _lang = lang.toLowerCase()
	const langs = {
		'ts':'typescript'
	}
	
	if(!Prism.languages[lang]) {
		_lang = langs[lang]
	}
	const highlighted = escape_svelty(
		_lang
			? Prism.highlight(code, Prism.languages[_lang], _lang)
			: escape(code)
	);
	return `
	<div class="relative my-12">
		<div class="codeblock">
			<pre class="language-${_lang} line-numbers relative pt-20">
				<h4 class="absolute top-0 right-1">${_lang}</h4>
				{@html \`<code class="language-${_lang}">${highlighted}</code>\`}
			</pre>
		</div>
	</div>`;
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
	// "smartypants": {
	// 	"dashes": "oldschool"
	// },
	highlight: {
		highlighter: highlighterFn
	},

	"remarkPlugins": [remarkReadingTime, remarkSponsor, remmarkPath, cloudinaryImages],
	"rehypePlugins": [[urls, processUrl],  [autoLinkHeadings, { behavior: 'wrap' }]]
};

export default config