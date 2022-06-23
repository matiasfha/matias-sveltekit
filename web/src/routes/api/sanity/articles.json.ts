import sanityClient from '@sanity/client'
import { isValidRequest } from '@sanity/webhook'
import type { RequestEvent } from '@sveltejs/kit'
import { createClient } from 'sanity-codegen'
import type { Documents, Posts } from '../../../schema.types'

import BlocksToMarkdown from '@sanity/block-content-to-markdown';
import imageUrlBuilder from '@sanity/image-url'
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN
})
interface Post {
    _createdAt: string,
    _id: string,
    _updatedAt: string,
    banner: {}
}
const clientOptions = {
    projectId: 'cyypawp1',
    dataset: 'production',
    fetch,
    apiVersion: '2022-06-23', // use current UTC date - see "specifying API version"!
    token: '', // or leave blank for unauthenticated usage
    useCdn: true, // `false` if you want to ensure fresh data
  }
const client = createClient<Documents>(clientOptions)

const builder = imageUrlBuilder(sanityClient(clientOptions))

function validateWebhook(request: Request){
    const headers = {}
    request.headers.forEach((value, key) => {
        headers[key] = value
    })
    return isValidRequest({...request, headers }, import.meta.env.SANITY_SECRET)
    
}

function generateMarkdown({
    date,
    banner,
    keywords,
    title,
    description,
    bannerCredit,
    content
}: {
    date: string,
    banner: string,
    keywords: string[],
    title: string,
    description: string,
    bannerCredit: string,
    content: Posts['content'] 
}) {
    const keys = keywords.map((keyword: string) => `- ${keyword}\n`).join().replace(',','')
    return `
---
date: ${date}
banner: ${banner}
keywords: \n${keys}
title: ${title}
description: ${description}
bannerCredit: ${bannerCredit}
tag: Posts
---

${BlocksToMarkdown(content, { projectId: 'cyypawp1', dataset: 'production' })}
                   
    `
}
async function createFileInRepo(content: string, title: string){
    try  {
        const slug = title.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\?|\¿/g, '')
            .replace(' ','-')
            .toLowerCase()
            

        const repo = {
            owner: 'matiasfha',
            repo:  'matias-sveltekit',
        }
        const sha = await octokit.rest.git.getRef({
            ...repo,   
            ref: `heads/main`
        })

         // Get the tree associated with master, and the content
        // of the template file to open the PR with.
        const tree = await octokit.rest.git.getTree({
            ...repo,
            tree_sha: sha.data.object.sha
        })
        // create the blob
        const blob = await octokit.rest.git.createBlob({
            ...repo,
            content
        })
        
        const newTree = await octokit.rest.git.createTree({
            ...repo,
            tree: [{
              path: 'web/src/routes/blog/post/test.svx',
              sha: blob.data.sha,
              mode: '100644',
              type: 'blob'
            }],
            base_tree: tree.data.sha
          })

        // Create a commit and a reference using the new tree
        const newCommit = await octokit.rest.git.createCommit({
            ...repo,
            message: `Create new post: ${title}`,
            parents: [sha.data.object.sha],
            tree: newTree.data.sha
        })

        await octokit.rest.git.createRef({
            ...repo,
            ref: `refs/heads/create-${slug}`,
            sha: newCommit.data.sha
        })

        const pr = await octokit.rest.pulls.create({
            ...repo,
            title: `Create new post: ${title}`,
            body: 'New Post from Sanity',
            head: `create-${slug}`,
            base: 'main'
        })

        const res = await octokit.rest.pulls.merge({
            ...repo,
            pull_number: pr.data.number,
        })
        
        await octokit.rest.git.deleteRef({
            ...repo,
            ref: `heads/create-${slug}`
        })
        
        return res.data

    }catch(e){
        console.error(e)
    }
    
}

export async function post({ request }: RequestEvent) {
    if(!validateWebhook(request)){
        return {
            status: 401,
            body: {
                error: 'Invalid Signature',
                request,
                headers: request.headers
            }
        }
    }
    try {
        const body = await request.json()
        
        const markdown = generateMarkdown({
            date : body._createdAt,    
            banner : builder.image(body.banner.asset._ref).url(),
            keywords : body.keywords,
            title : body.title,
            description : body.description,
            bannerCredit : body.banner.bannerCredit,
            content : body.content
        })
        
        
        const res = await createFileInRepo(markdown, body.title)
        return {
            body: {
                res,
                title: body.title,
            }
        };
    } catch (e) {
        console.error(e);
        return {
            status: 500,
            body: e.message
        };
    }
}

export async function get({ params, request }: RequestEvent) {
    if(!validateWebhook(request)){
        return {
            status: 401,
            body: 'Invalid signature'
        }
    }
    try {
		const [post] = await client.query<Posts>('*[_type == "posts"]')
        
        const markdown = generateMarkdown({
                date : post._createdAt,
                banner : builder.image(post.banner.asset._ref).url(),
                keywords : post.keywords,
                title : post.title,
                description : post.description,
                bannerCredit : post.banner.bannerCredit,
                content : post.content
           })
        const res = await createFileInRepo(markdown, post.title)
		return {
			body: {
				res,
                title: post.title,
			}
		};
	} catch (e) {
		console.error(e);
		return {
			status: 500,
			body: e.message
		};
	}
}
