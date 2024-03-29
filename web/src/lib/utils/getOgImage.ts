function getOgImage({ text, tags }: { text: string; tags: string[] }) {
	const imageConfig = [
		'w_1280',
		'h_669',
		'c_fill', // fill to given dimensions (crop parameter)
		'q_auto:best', // default quality
		'f_auto' // automatic format seleection
	].join(',');

	const titleConfig = [
		'w_760', //text area width, wrap the text
		'c_fit', //crop setting to fit the content to the width
		'co_rgb:FFFFFF',
		'g_south_west', //set "gravity" of the text. Anchor to bottom left of image
		'x_550', // position the text in X px
		'y_300', // move the text in Y px
		`l_text:montserrat_78_bold:${encodeURIComponent(text)}` // tells cloudinary that we will add a text overlay with font "futura" size 64 ad content ${title}
	].join(',');

	const url = [
		'https://res.cloudinary.com',
		'matiasfha',
		'image',
		'upload',
		imageConfig,
		titleConfig,
		'social-card.png'
	];
	return url.join('/');
}

export default getOgImage;
