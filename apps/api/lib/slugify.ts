export default function slugify(text: string) {
	return (
		text
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			//eslint-disable-next-line
			.replace(/\?|\¿/g, '')
			.replace(/\s+/g, '-')
			.replace(/:+/g, '')
			.trim()
			.toLowerCase()
	);
}

