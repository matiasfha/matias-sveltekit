import type { RequestHandler } from './$types';
import getPosts from '$lib/api/getPosts';

const website = 'https://matiashernandez.dev';

const pages = [
	'about',
	'newsletter',
	'articles',
	'blog',
	'uses',
	'sponsorships',
	'topic/react',
	'topic/typescript',
	'topic/javascript',
	'topic/node',
	'topic/css',
	'topic/graphql'
];

export const GET: RequestHandler = async ({ url }) => {
	const lang = undefined;
	const res  = await getPosts(lang)
	const posts = res.filter(p => p.canonical.includes('matiashernandez.dev'));
	const headers = {
		'Cache-Control': 'max-age=604800 must-revalidate',
		'Content-Type': 'application/xml'
	};

	return new Response(
		`<?xml version="1.0" encoding="UTF-8" ?>
    <urlset
      xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
      xmlns:xhtml="https://www.w3.org/1999/xhtml"
      xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
      xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
      xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
    >
      <url>
        <loc>${website}</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      ${pages
				.map(
					(page) => `
        <url>
            <loc>${website}/${page}</loc>
            <changefreq>daily</changefreq>
            <priority>0.7</priority>
        </url>
        `
				)
				.join('')}
      ${posts
				.map(
					(post) =>
						`
    <url>
        <loc>${website}${post.slug}</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
    </url>
    `
				)
				.join('')}
    </urlset>`,
		{ headers }
	);
};
