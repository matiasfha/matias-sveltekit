import '@sveltejs/kit/node/polyfills';

const directives = {
	// 'connect-src': ["'self'", 'ws://localhost:*'],
	'connect-src': [
		"'self'",
		'ws://localhost:*',
		'https://hcaptcha.com',
		'https://*.hcaptcha.com',
		process.env['VITE_WORKER_URL']
	],
	'frame-src': ['https://hcaptcha.com', 'https://*.hcaptcha.com'],
	'style-src': ["'self'", "'unsafe-inline'", 'https://hcaptcha.com', 'https://*.hcaptcha.com'],
	'script-src': ["'self'", "'unsafe-inline'", 'https://hcaptcha.com', 'https://*.hcaptcha.com']
};
