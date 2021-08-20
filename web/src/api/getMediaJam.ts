import { request, gql } from 'graphql-request';
const query = gql`
    allPost(where: { author: { _id: { eq: "e-603fc5c4e6c0b4006873832e-self" } } }) {
        slug {
            current
        }
        _id
        title
        description
        tags {
            _id
            title
        }
        author {
            name
            image {
                asset {
                    url
                }
            }
        }
        postMetadata {
            eatured
        }
    }
`;

export default async function getMediaJams() {
	const data = await request('https://v2.mediajams.dev/api/graphql', query);
	return data;
}
