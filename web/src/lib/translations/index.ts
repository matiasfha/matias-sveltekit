import i18n from 'sveltekit-i18n';
import type { Config } from 'sveltekit-i18n';

const lang = {
	en: 'English',
	es: 'Español'
};

const config: Config = {
	translations: {
		en: { lang },
		es: { lang }
	},
	initLocale: 'en',
	fallbackLocale: 'en',
	log: {
		level: 'debug'
	},
	loaders: [
		{
			locale: 'en',
			key: 'common',
			loader: async () => (await import('./en/common.json')).default
		},
		{
			locale: 'es',
			key: 'common',
			loader: async () => (await import('./es/common.json')).default
		},
		{
			locale: 'en',
			key: 'home',
			routes: ['/'],
			loader: async () => (await import('./en/home.json')).default
		},
		{
			locale: 'es',
			key: 'home',
			routes: ['/'],
			loader: async () => (await import('./es/home.json')).default
		},
		{
			locale: 'en',
			key: 'articles',
			routes: ['/articles'],
			loader: async () => (await import('./en/articles.json')).default
		},
		{
			locale: 'es',
			key: 'articles',
			routes: ['/articles'],
			loader: async () => (await import('./es/articles.json')).default
		},
		{
			locale: 'en',
			key: 'blog',
			routes: ['/blog'],
			loader: async () => (await import('./en/blog.json')).default
		},
		{
			locale: 'es',
			key: 'blog',
			routes: ['/blog'],
			loader: async () => (await import('./es/blog.json')).default
		},
		{
			locale: 'en',
			key: 'courses',
			routes: ['/courses'],
			loader: async () => (await import('./en/courses.json')).default
		},
		{
			locale: 'es',
			key: 'courses',
			routes: ['/courses'],
			loader: async () => (await import('./es/courses.json')).default
		}
	]
};

export const { t, locale, locales, loading, loadTranslations } = new i18n(config);
loading.subscribe(($loading) => $loading && console.log('Loading translations...'));
