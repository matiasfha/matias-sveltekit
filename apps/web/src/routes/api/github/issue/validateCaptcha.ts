export async function validateCaptcha(captchaResponse: string) {
	const secret = process.env['HCAPTCHA_SECRETKEY'];
	const sitekey = process.env['VITE_HCAPTCHA_SITEKEY'];
	const body = new URLSearchParams({
		response: captchaResponse,
		secret,
		sitekey
	});
	try {
		const response = await fetch('https://hcaptcha.com/siteverify', {
			method: 'POST',
			credentials: 'omit',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: body.toString()
		});
		const data = await response.json();
		const { success } = data;
		return success;
	} catch (e) {
		console.error(e);
		return false;
	}
}
