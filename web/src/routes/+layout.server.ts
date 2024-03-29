import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url, request }) => {
	if (
		request.headers.has('accept-language') &&
		!request.headers.get('user-agent').includes('Googlebot')
	) {
		const accepted = request.headers.get('accept-language')?.match(/[a-zA-Z-]{2,10}/gm) || ['en'];
		let defaultLocale = 'en'; // get from cookie, user session, ...
		if (accepted.includes('es')) {
			defaultLocale = 'es';
		}
		const currentCookie = cookies.get('lang');
		if (!currentCookie) {
			cookies.set('lang', defaultLocale, {
				path: '/'
			});
		}
		const initLocale = cookies.get('lang') || defaultLocale; // set default if no locale already set

		return {
			lang: initLocale,
			pathname: url.pathname
		};
	}
	return {
		lang: null,
		pathname: url.pathname
	};
};
