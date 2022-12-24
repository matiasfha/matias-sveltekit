import path from 'path';

export function remmarkPath() {
	return async function transformer(tree, vFile) {
		const filepath = path.relative('__dirname', vFile.filename).replace(/^(.){2}/, '');
		if (!vFile.data.fm) {
			vFile.data.fm = {};
		}

		vFile.data.fm.filepath = filepath;
		if (!vFile.data.fm.canonical) {
			const slug = filepath.slice(11, -10);
			vFile.data.fm.canonical = `https://matiashernandez.dev${slug}`;
		}
	};
}
