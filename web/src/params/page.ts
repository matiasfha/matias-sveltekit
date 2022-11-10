/** @type {import('@sveltejs/kit').ParamMatcher} */
export function match(param) {
	return /^(about|sponsorships)$/.test(param);
}
