import getPosts from "$lib/api/getPosts";
import type { RequestHandler } from "./$types"
import { Courses } from '$lib/api/getEggheadCourses';

import { client, builder } from '$lib/utils/sanityClient';
import { Articles } from '$lib/api/getAllExternalArticles';
import { json } from "@sveltejs/kit";

async function getCourses(lang: string, tag: string) {
    const courses = await client
        .fetch(
            `*[_type == "egghead-courses" && language match "${lang}" && category match "${tag}"] | order(updated_at desc)
		{image, title, category, language, updated_at, type, featured, url, description}
		`
        )
        .then((result) => {
            return Courses.parse(result);
        });
    return courses.map((item) => ({ ...item, image: builder.image(item.image).url() }));
}

async function getArticles(lang: string, tag: string) {
    const query = `*[_type == "external-articles" && category match '${tag}' && language match "${lang}"] | order(_createdAt desc){
		url, title, image, published_at, tag, featured, description
	}`;
    const articles = await client.fetch(query).then((result) => {
        return Articles.parse(result);
    });
    return articles.map((item) => {
        return {
            ...item,
            image: builder.image(item.image).url()
        };
    });
}

async function getData(lang: string, tag: string) {
    const postsP = getPosts(lang);
    const coursesP = getCourses(lang, tag);
    const articlesP = getArticles(lang, tag);
    const [posts, courses, articles] = await Promise.all([postsP, coursesP, articlesP]);

    return {
        posts: posts.filter((item) => item.tag?.toLowerCase() === tag),
        courses,
        articles
    };
}
import { env } from '$env/dynamic/private';
export const GET = (async ({ request }) => {
    if (request.headers.get('HandShake') === env.SecretToCheckForSanity) {

        const enData = await getData('en', 'typescript')
        const esData = await getData('es', 'typescript')
        return json({
            enData,
            esData
        })
    }
    return json({ notAllowed: "You can't be here" })
}) satisfies RequestHandler
