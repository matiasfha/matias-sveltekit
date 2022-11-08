import type { LayoutData } from './$types';
import { locale, loadTranslations, locales } from '$lib/translations';
export const load: LayoutData = async ({ data }) => {
	const { lang, pathname } = data;
	await loadTranslations(lang, pathname);
	return {};
};
