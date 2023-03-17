import { sveltekit } from '@sveltejs/kit/vite';
import path from 'node:path';
import { partytownVite } from '@builder.io/partytown/utils';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit(),
		partytownVite({
			// `dest` specifies where files are copied to in production
			dest: path.join(process.cwd(), 'static', '~partytown')
		})
	],
	resolve: {
		alias: {
			$components: path.resolve('./src/components'),
			$images: path.resolve('./src/images'),
			$utils: path.resolve('./src/lib/utils')
		}
	},
	optimizeDeps: {
		exclude: ['is-buffer']
	}
};

export default config;
