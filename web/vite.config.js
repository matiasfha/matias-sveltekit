import { sveltekit } from '@sveltejs/kit/vite';
import path from 'node:path'
import { imagetools } from "vite-imagetools";

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), imagetools({ force: true })],
	resolve: {
		alias: [
			{ find: '$components', replacement: path.resolve('./src/components')},
			{ find: '$api', replacement: path.resolve('./src/api')},
			{ find: '$images', replacement: path.resolve('./src/images'),},
			{ find: '$utils', replacement: path.resolve('./src/lib/utils'),}
		],
	}
};

export default config;
