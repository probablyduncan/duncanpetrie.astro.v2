/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'selector',
	theme: {
		extend: {
			fontFamily: {
				'sans': ['Inter, Inter-Fallback', { fontFeatureSettings: '"cv11", "ss01"' }],
				'serif': ['Junicode, Junicode-Fallback'],
				'mono': ['PT Mono, Consolas, monospace'],
			}
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
