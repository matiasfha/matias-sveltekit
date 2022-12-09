import type { LayoutData } from './$types';
import { loadTranslations } from '$lib/translations';
export const load: LayoutData = async ({ data }) => {
	const { lang, pathname } = data;
	await loadTranslations(lang, pathname);
	return {};
};
