import headings from "remark-autolink-headings";
import slug from "remark-slug";
import  highlight from 'remark-highlight.js';

const config = {
  "extensions": [".svelte.md", ".md", ".svx", '.mdx'],

  "smartypants": {
    "dashes": "oldschool"
  },

  "remarkPlugins": [headings, slug, highlight],
  "rehypePlugins": []
};

export default config;