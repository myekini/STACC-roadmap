import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

// Stacc palette (mirrors landing-page dark tokens in src/app/globals.css).
// Hex literals (not var()) so Tailwind 3 opacity modifiers like bg-primary/10 keep working.
const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			'navy': 'var(--navy)',
  			'cyan': 'var(--cyan)',
  			'orange': 'var(--orange)',
  			'on-secondary': 'var(--navy)',
  			'surface-container': 'var(--surface-container)',
  			'on-tertiary-fixed': '#2a1700',
			'error': 'var(--error)',
			'error-action': 'var(--error-action)',
  			'surface-bright': 'var(--surface-bright)',
  			'surface-tint': 'var(--cyan)',
  			'on-primary-fixed-variant': '#003ea8',
  			'on-tertiary-container': '#ffeedd',
  			'error-container': '#3b1518',
  			'on-surface-variant': 'var(--fg-muted)',
			'secondary': 'var(--success)',
  			'on-tertiary': 'var(--navy)',
  			'surface-container-low': 'var(--surface-container-low)',
  			'outline-variant': 'var(--border-subtle)',
  			'tertiary-fixed': '#ffddb8',
  			'surface-dim': 'var(--navy)',
  			'outline': 'var(--fg-muted)',
  			'tertiary-fixed-dim': '#ffb95f',
			'on-primary': 'var(--on-action)',
  			'on-background': 'var(--foreground)',
  			'secondary-fixed-dim': '#34d399',
  			'on-primary-container': '#ffe3d5',
  			'surface-container-lowest': 'var(--surface-container-low)',
  			'surface': 'var(--surface-card)',
  			'on-secondary-fixed-variant': '#005236',
  			'background': 'var(--background)',
  			'on-tertiary-fixed-variant': '#653e00',
			'on-error': 'var(--on-error)',
  			'primary-container': '#8a3e1c',
  			'inverse-surface': '#f7f8fc',
  			'surface-container-high': 'var(--surface-container-high)',
  			'on-error-container': '#ffb4ab',
  			'surface-container-highest': 'var(--surface-container-high)',
			'tertiary': 'var(--warning)',
  			'on-surface': 'var(--foreground)',
  			'surface-variant': 'var(--surface-container-high)',
  			'primary-fixed': '#a5edff',
			'on-primary-fixed': 'var(--on-signal)',
  			'secondary-fixed': '#6ffbbe',
  			'tertiary-container': '#996100',
  			'primary': 'var(--orange)',
			'primary-neon': 'var(--orange-neon)',
			'primary-label': 'var(--orange-label)',
  			'inverse-primary': 'var(--orange)',
  			'inverse-on-surface': 'var(--navy)',
  			'primary-fixed-dim': 'var(--cyan)',
  			'on-secondary-fixed': '#002113',
  			'secondary-container': '#6cf8bb',
  			'on-secondary-container': '#00714d',
  			// shadcn semantic tokens mapped to CSS variables
  			'foreground': 'var(--foreground)',
  			'card': {
  				DEFAULT: 'var(--surface-card)',
  				foreground: 'var(--foreground)'
  			},
  			'popover': {
  				DEFAULT: 'var(--surface-card)',
  				foreground: 'var(--foreground)'
  			},
  			'muted': {
  				DEFAULT: 'var(--surface-container-low)',
  				foreground: 'var(--fg-muted)'
  			},
  			'accent': {
  				DEFAULT: 'var(--surface-container-high)',
  				foreground: 'var(--foreground)'
  			},
  			'destructive': {
				DEFAULT: 'var(--error-action)',
				foreground: 'var(--on-error)'
			},
			'primary-foreground': 'var(--on-action)',
  			'secondary-foreground': 'var(--navy)',
  			'border': 'var(--border-subtle)',
  			'input': 'var(--border-subtle)',
  			'ring': 'var(--cyan)',
  			'chart': {
				'1': 'var(--chart-1)',
				'2': 'var(--chart-2)',
				'3': 'var(--chart-3)',
				'4': 'var(--chart-4)',
				'5': 'var(--chart-5)'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			'none': '0',
  			'sm': '0',
  			'DEFAULT': '0',
  			'md': '0',
  			'lg': '0',
  			'xl': '0',
  			'2xl': '0',
  			'3xl': '0',
  			'full': '9999px'
  		},
  		spacing: {
  			'base': '4px',
  			'lg': '24px',
  			'container-max': '1280px',
  			'md': '16px',
  			'xl': '40px',
  			'xs': '4px',
  			'gutter': '24px',
  			'sm': '8px',
  			'safe': 'env(safe-area-inset-bottom)'
  		},
  		fontFamily: {
  			'headline-lg-mobile': [
  				'var(--font-geist-sans)',
  				'sans-serif'
  			],
  			'code': [
  				'var(--font-geist-mono)',
  				'monospace'
  			],
  			'mono': [
  				'var(--font-geist-mono)',
  				'monospace'
  			],
  			'headline-lg': [
  				'var(--font-geist-sans)',
  				'sans-serif'
  			],
  			'body-lg': [
  				'var(--font-geist-sans)',
  				'sans-serif'
  			],
  			'body-sm': [
  				'var(--font-geist-sans)',
  				'sans-serif'
  			],
  			'display': [
  				'var(--font-geist-sans)',
  				'sans-serif'
  			],
  			'headline-md': [
  				'var(--font-geist-sans)',
  				'sans-serif'
  			],
  			'body-md': [
  				'var(--font-geist-sans)',
  				'sans-serif'
  			],
  			'label-md': [
  				'var(--font-geist-sans)',
  				'sans-serif'
  			],
  			'label-md-mobile': [
  				'var(--font-geist-sans)',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			'headline-lg-mobile': [
  				'24px',
  				{
  					lineHeight: '32px',
  					fontWeight: '600'
  				}
  			],
  			'code': [
  				'14px',
  				{
  					lineHeight: '20px',
  					fontWeight: '400'
  				}
  			],
  			'headline-lg': [
  				'32px',
  				{
  					lineHeight: '40px',
  					letterSpacing: '-0.01em',
  					fontWeight: '600'
  				}
  			],
  			'body-lg': [
  				'18px',
  				{
  					lineHeight: '28px',
  					fontWeight: '400'
  				}
  			],
  			'body-sm': [
  				'14px',
  				{
  					lineHeight: '20px',
  					fontWeight: '400'
  				}
  			],
  			'display': [
  				'48px',
  				{
  					lineHeight: '56px',
  					letterSpacing: '-0.02em',
  					fontWeight: '700'
  				}
  			],
  			'headline-md': [
  				'24px',
  				{
  					lineHeight: '32px',
  					fontWeight: '600'
  				}
  			],
  			'body-md': [
  				'16px',
  				{
  					lineHeight: '24px',
  					fontWeight: '400'
  				}
  			],
  			'label-md': [
  				'14px',
  				{
  					lineHeight: '20px',
  					letterSpacing: '0.02em',
  					fontWeight: '600'
  				}
  			],
  			'label-md-mobile': [
  				'12px',
  				{
  					lineHeight: '16px',
  					letterSpacing: '0.02em',
  					fontWeight: '600'
  				}
  			]
  		}
  	}
  },
  plugins: [
    forms,
  ],
};
export default config;
