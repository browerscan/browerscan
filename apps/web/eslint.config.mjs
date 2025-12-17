import nextConfig from "eslint-config-next";

const config = [
	...nextConfig,
	{
		ignores: [
			'.next/**',
			'out/**',
			'build/**',
			'.open-next/**',
			'.vercel/**',
			'node_modules/**',
			'test-results/**',
			'coverage/**',
			'cloudflare-env.d.ts'
		]
	}
];

export default config;
