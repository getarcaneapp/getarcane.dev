// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import lucode from 'lucode-starlight';

export default defineConfig({
	site: 'https://getarcane.dev',
	integrations: [
		starlight({
			title: 'getarcane.dev',
			description: 'Documentation for the Go modules published under go.getarcane.app.',
			logo: {
				src: './src/assets/logo.svg',
				alt: 'go.getarcane.app',
			},
			favicon: '/favicon.png',
			customCss: ['./src/styles/global.css'],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/getarcaneapp/kit' },
				{ icon: 'discord', label: 'Discord', href: 'https://discord.gg/WyXYpdyV3Z' },
			],
			plugins: [
				lucode({
					navLinks: [
						{ label: 'Guides', link: '/guides/introduction/' },
						{ label: 'Modules', link: '/kit/' },
						{ label: 'pkg.go.dev', link: 'https://pkg.go.dev/go.getarcane.app/kit' },
					],
					footerText:
						'These modules are released under the [BSD 3-Clause License](https://github.com/getarcaneapp/kit/blob/main/LICENSE). Built with [Starlight](https://starlight.astro.build) and [Lucode](https://lucas-labs.github.io/lucode-starlight-theme/).',
				}),
			],
			sidebar: [
				{
					label: 'Guides',
					items: [
						{ slug: 'guides/introduction' },
						{ slug: 'guides/installation' },
					],
				},
				{
					label: 'Core',
					items: [{ slug: 'kit' }],
				},
				{
					label: 'Filesystem',
					items: [
						{ slug: 'acfs' },
						{ slug: 'acfs/cli' },
					],
				},
				{
					label: 'Docker',
					items: [
						{ slug: 'docker' },
						{ slug: 'docker/compat' },
						{ slug: 'docker/convert' },
						{ slug: 'builds' },
						{ slug: 'updater' },
						{ slug: 'updater/tag-policies' },
					],
				},
				{
					label: 'Streaming',
					items: [{ slug: 'streams' }],
				},
				{
					label: 'System',
					items: [
						{ slug: 'sys/bytes' },
						{ slug: 'sys/cgroup' },
						{ slug: 'sys/crypto' },
						{ slug: 'sys/atomic', badge: { text: 'Deprecated', variant: 'caution' } },
					],
				},
			],
		}),
	],
});
