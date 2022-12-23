export function setDefaultLang() {
	return async function (info, vFile) {
		if (!vFile.data.fm) {
			vFile.data.fm = {};
		}
		if (!vFile.data.fm.lang) {
			vFile.data.fm.lang = 'es';
		}
	};
}
