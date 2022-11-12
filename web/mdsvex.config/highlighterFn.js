import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';
import escape from 'escape-html';

loadLanguages(['typescript', 'java', 'bash', 'rust', 'clojure', 'elm', 'elixir', 'jsx', 'objectivec', 'graphql', 'json']);
// escape curlies, backtick, \t, \r, \n to avoid breaking output of {@html `here`} in .svelte
const escape_svelty = (str) => str
	.replace(
		/[{}`]/g,
		(c) => ({ '{': '&#123;', '}': '&#125;', '`': '&#96;' }[c])
	)
	.replace(/\\([trn])/g, '&#92;$1');
/**
 * @param code {string} - code to highlight
 * @param lang {string} - code language
 * @param meta {string} - code meta
 * @returns {Promise<string>} - highlighted html
 */
export function highlighterFn(code, lang = 'js', meta) {

	let _lang = lang.toLowerCase();

	// const highlighted = escape_svelty(
	// 	_lang
	// 		? Prism.highlight(code, Prism.languages[_lang], _lang)
	// 		: escape(code)
	// );
	const highlighted = escape_svelty(Prism.highlight(code, Prism.languages[_lang], _lang))

	return `
	<div class="relative my-12 code-block">
		<div class="fullbleed-wrapper">
			<div class="snippet">
				<div class="snippet-lang">
					<span>${_lang}</span>
				</div>
				<pre class="language-${_lang}">
					{@html \`<code class="language-${_lang}">
						${highlighted}
					</code>\`}
				</pre>
			</div>
		</div>
	</div>
	`;
}
