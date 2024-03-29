/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: [
		"./src/**/*.{html,js,svelte,ts}",
	],
	theme: {
		fontFamily: {
			'sans': ['Poppins', 'sans-serif'],
			'body': ['Anonymous Pro', 'monospace']
		},
		extend: {
			colors: {
				'ebony-clay': { DEFAULT: '#242F42', '50': '#8BA0C1', '100': '#7A92B8', '200': '#5977A6', '300': '#475F85', '400': '#364763', '500': '#242F42', '600': '#121821', '700': '#000000', '800': '#000000', '900': '#000000' },
				'purple': { DEFAULT: '#6366F1' },
				'blueGray': '#9591D6',
				'blueGray-600':'#9B90D4',
				'blueGray-400':'#AC90D1',
				
				
			},
			typography: theme => {
				const fontSize = size => {
					const result = theme(`fontSize.${size}`)
					return Array.isArray(result) ? result[0] : result
				}
				return {
					DEFAULT: {
						css: [
							{
								a: {
									textDecoration: 'none',
									whiteSpace: 'pre-wrap'
								},
								hr: { borderColor: theme('colors.gray.200') },
								'strong, a, h1, h2, h3, h4, h5, h6': {
									color: '#6366F1'
								},
								'h1, h2, h3, h4, h5, h6': {
									margin: '0 auto',
									whiteSpace: 'pre-wrap'
								},
								strong: {
									fontWeight: theme('fontWeight.bold'),
									fontSize: fontSize('lg'),
								},
								pre: {
									backgroundColor: theme('colors.ebony-clay.700')
								},
								code: {
									fontSize: '0.9em',
									letterSpacing: '-0.5px',
									padding: '4.5px 6px',
									margin: '1px -1px',
									borderRadius: '3px',
									color: theme('colors.ebony-clay.700'),
									fontStyle: 'italic'
								},
								th: {
									color: '#fde68a'
								}
							}
						]
					},
					dark: {
						css: [
							{
								'strong, a, h1, h2, h3, h4, h5, h6': {
									color: '#fde68a'
								},
								code: {
									color: theme('colors.gray.200'),
								},
								

							}
						]
					},
					light: {
						css: [
							{
								hr: { borderColor: theme('colors.gray.200') },
								'strong, a, h1, h2, h3, h4, h5, h6': {
									color: '#6366F1'
								},
							}
						]
					},

				}
			}
		},
	},
	plugins: [
		require('@tailwindcss/aspect-ratio'),
		require('@tailwindcss/typography'),
	],
}
