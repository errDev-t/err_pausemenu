/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		fontFamily: {
			inter: ['var(--font-inter)', 'sans-serif'],
			share: ['var(--font-share)', 'monospace'],
  		},
		keyframes: {
			floating: {
				"0%, 100%": {
					transform: "translateX(0px)",
				},
				"50%": {
					transform: "translateX(-7px)",
				},
			},
		},
        animation: {
			floating: "floating 1.25s cubic-bezier(0.45, 0, 0.55, 1) infinite",
		},
  		colors: {
			white: 'hsl(var(--main-white))',
			hudBlack: 'hsla(var(--hud-black))',
			iconBlack: 'hsla(var(--icon-black))',

			ink: 'hsl(var(--ink))',
			inkDim: 'hsl(var(--ink-dim))',
			inkFaint: 'hsl(var(--ink-faint))',
			mainColor: 'hsl(var(--mainColor))',
			line: 'hsla(var(--line))',

			cardBlack: 'hsl(var(--card-black))',
			cardWhite: 'hsl(var(--card-white))',

			offwhite: 'hsl(var(--offwhite))',
  			main: 'hsl(var(--main))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

