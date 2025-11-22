import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rstu: {
          red: '#cc0000',
          'red-dark': '#990000',
          'red-light': '#ff0000',
        },
      },
    },
  },
  plugins: [],
}
export default config
