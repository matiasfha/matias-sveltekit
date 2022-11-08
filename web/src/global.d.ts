/// <reference types="@sveltejs/kit" />
interface ImportMetaEnv {
	VITE_MEDIUM_TOKEN: string;
	VITE_DEVTO_TOKEN: string;
	VITE_GITHUB_TOKEN: string;
	VITE_HASHNODE_TOKEN: string;
	VITE_SANITY_SECRET: string;
	VITE_NETLIFY_TOKEN: string;
	VITE_HCAPTCHA_SITEKEY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
