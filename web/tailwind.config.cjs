const config = {
	mode: "jit",
	darkMode: "media",
	purge: [
		"./src/**/*.{html,js,svelte,ts}",
	],
	theme: {
		fontFamily: {
			'sans': ['Poppins','sans-serif'],
			'body': ['Anonymous Pro', 'monospace']
		},
		extend: {
			colors: {
				'ebony-clay': {  DEFAULT: '#242F42',  '50': '#8BA0C1',  '100': '#7A92B8',  '200': '#5977A6',  '300': '#475F85',  '400': '#364763',  '500': '#242F42',  '600': '#121821',  '700': '#000000',  '800': '#000000',  '900': '#000000'},
			}
		},
	},
	plugins: [
		require('@tailwindcss/aspect-ratio')
	],
};

module.exports = config;
