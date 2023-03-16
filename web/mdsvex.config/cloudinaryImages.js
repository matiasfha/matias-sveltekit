import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	secure: true
});

async function uploadImage(imagePath, withLogo = false) {
	/**
	 * @type {import('cloudinary/types/index').UploadApiOptions}'}
	 */
	let cloudinaryOptions = {
		use_filename: true,
		unique_filename: false,
		overwrite: true,
		resource_type: 'image',
	};
	if (withLogo) {

		cloudinaryOptions['transformation'] = [
			{ effect: "auto_contrast", gravity: "south_west", overlay: { font_family: "montserrat", font_size: 30, text: "%40matiasfha" }, x: 20, y: 10 },
			{ overlay: 'logo', width: 400, x: '300', y: '100', gravity: 'north_east' },
			{ flag: 'layer_apply', },
		];

	}

	try {
		// Upload the image
		return await cloudinary.uploader.upload(imagePath, cloudinaryOptions);

	} catch (error) {
		console.error(error);
	}
}
export function cloudinaryImages() {
	/**
	 * @param {Node} node
	 */
	return async function transformer(tree, vFile) {
		try {
			if (vFile.data.fm.banner) {
				const image = vFile.data.fm.banner;
				if (!image.includes('https://res.cloudinary.com')) {
					const res = await uploadImage(image);
					if (res?.secure_url) {
						vFile.data.fm['banner'] = cloudinary.url(res.public_id, {quality: 'auto', fetch_format: 'auto', format: 'jpg'})
						// vFile.data.fm['banner'] = res.secure_url;
					}

				}
			}
		} catch (e) {
			console.error(e);
			vFile.data.fm['banner'] = vFile.data.fm.banner;
		}



	};
}
