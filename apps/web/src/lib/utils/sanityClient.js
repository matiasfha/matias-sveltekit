import sanityClient from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import BlocksToMarkdown from '@sanity/block-content-to-markdown';

export const sanityProjectId = 'cyypawp1';
const clientOptions = {
	projectId: sanityProjectId,
	dataset: 'production',
	fetch,
	apiVersion: '2022-06-23', // use current UTC date - see "specifying API version"!
	token: '', // or leave blank for unauthenticated usage
	useCdn: true // `false` if you want to ensure fresh data
};

const serializers = {
	types: {
		code: (props) => '```' + props.node.language + '\n' + props.node.code + '\n```',
		table: (props) => {
			const { rows } = props.node;
			const headers = rows[0].cells;

			const headersMarkdown = headers.map((header) => `${header}`).join(' | ');

			const separator = '|' + headers.map(() => '---').join(' | ') + '|';

			const rowsContent = rows.slice(1, rows.length).map((row) => row.cells);

			const rowsMarkdown = rowsContent.map((row) => `| ${row.join(' | ')} |`).join('\n');
			return `| ${headersMarkdown} |\n${separator}\n${rowsMarkdown}`;
		},
		image: (props) => {
			return `![${props.node.alt}](${builder.image(props.node)})`;
		}
	}
};

export function getRawMarkdown(content) {
	return BlocksToMarkdown(content, {
		projectId: sanityProjectId,
		dataset: 'production',
		serializers
	}).trim();
}
export const client = sanityClient(clientOptions);
export const builder = imageUrlBuilder(client);
