import { locale } from '$lib/translations';
export function isEn() {
	return locale.get() === 'en';
}
