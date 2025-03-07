/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'selector',
	theme: {
		extend: {
			fontFamily: {
				'sans': ['Inter, Inter-Fallback',],
				'serif': ['Junicode, Junicode-Fallback'],
				'mono': ['PT Mono, Consolas, monospace'],
			}
		},
		colors: {
			...colors,
			'c': {
				DEFAULT: "#00ffff",
			},
			'm': {
				DEFAULT: "#ff00ff",
			},
			'y': {
				DEFAULT: "#ffff00",
			},
			'k': {
				DEFAULT: "#000000",
			},
			'r': {
				DEFAULT: "#ff0000",
			},
			'g': {
				DEFAULT: "#00ff00",
			},
			'b': {
				DEFAULT: "#0000ff",
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
