export default function slugify(text: string) {
	return text
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/\?|\¿/g, '')
		.replace(/\s+/g, '-')
		.replace(/:+/g, '')
		.trim()
		.toLowerCase();
}
