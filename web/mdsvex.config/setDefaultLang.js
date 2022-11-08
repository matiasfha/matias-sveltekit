export function setDefaultLang() {
	return async function (info, file) {
		if (!file.data.fm.lang) {
			file.data.fm.lang = 'es';
		}
	};
}
