import { request, gql } from 'graphql-request';
import BlocksToMarkdown from '@sanity/block-content-to-markdown';
import path from 'path';
import { Octokit } from 'octokit';

const query = gql`
	query pages {
		allPage {
			name
			title
			description
			contentRaw
		}
	}
`;

interface Page {
	name: string;
	title: string;
	description: string;
	contentRaw: JSON;
}

const owner = 'matiasfha';
const repo = 'nicole_apapacho';
const octo = new Octokit({
	auth: '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' // @TODO this need to be secrets in env
});

async function getPages(): Promise<Array<{ path: string; content: string }>> {
	const { allPage } = await request<{
		allPage: Array<Page>;
	}>('https://cyypawp1.api.sanity.io/v1/graphql/production/default', query);

	const content = allPage.map((page) => {
		const { name, contentRaw, title, description } = page;
		return {
			path: path.join(`src/routes/${name}.svx`),
			content: `
---
layout: pages
title: ${title}
description: ${description}
---

${BlocksToMarkdown(contentRaw, { projectId: 'cyypawp1', dataset: 'production' })}
                `
		};
	});
	return content;
}

async function generateTree({ contents }) {
	const getBlobs = async () => {
		return Promise.all(
			contents.map(({ content }) => {
				return octo.rest.git.createBlob({
					owner,
					repo,
					content,
					encoding: 'utf-8'
				});
			})
		);
	};
	const blobs = await getBlobs();
	return blobs.map((blob, index) => {
		const path = contents[index].path;
		return {
			path,
			mode: `100644`,
			type: `blob`,
			sha: blob.data.sha
		};
	});
}

async function createCommit({ tree }) {
	const { data: refData } = await octo.rest.git.getRef({
		owner,
		repo,
		ref: `heads/main`
	});
	const commitSha = refData.object.sha;
	const { data: commitData } = await octo.rest.git.getCommit({
		owner,
		repo,
		commit_sha: commitSha
	});

	const { data } = await octo.rest.git.createTree({
		/*@ts-ignore */
		owner,
		repo,
		tree,
		base_tree: commitData.tree.sha
	});
	const commit = await octo.rest.git.createCommit({
		owner,
		repo,
		message: 'New Pages',
		tree: data.sha,
		parents: [commitData.sha]
	});
	await octo.rest.git.updateRef({
		owner,
		repo,
		ref: 'heads/main',
		sha: commit.data.sha
	});

	return commit;
}
export async function post() {
	const contents = await getPages();
	const tree = await generateTree({ contents });
	const commit = await createCommit({ tree });
	return {
		body: commit
	};
}
