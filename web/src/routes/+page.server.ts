import type { PageServerLoad } from './$types';
import { getLatestArticle } from '$lib/api/getAllExternalArticles';
import getCourses, { getLatestCourse } from '$lib/api/getEggheadCourses';
import { getLatest } from '$lib/api/getPodcast';
import { getLatestPost } from '$lib/api/getPosts';
import getFavorites from '$lib/api/getFavorites';
import { locale } from '$lib/translations';
import { redirect } from '@sveltejs/kit';
// import { getVideos } from '$lib/api/getYoutubeChannel';
import { OpenAI } from 'langchain/llms';
import { RetrievalQAChain } from 'langchain/chains';
import { SupabaseVectorStore } from 'langchain/vectorstores';
import { PromptTemplate } from 'langchain/prompts';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { createClient } from '@supabase/supabase-js';

async function getLatestContent(lang?: string) {
	try {
		const postP = getLatestPost(lang);

		const courseP = getLatestCourse(lang);
		const articleP = getLatestArticle(lang);
		const cafeConTechP = getLatest('https://anchor.fm/s/a1ac9eb8/podcast/rss');
		// const youtubeP = getVideos();
		const promises = [postP, courseP, articleP, cafeConTechP];
		// if (lang === 'es') {
		// 	const controlRemotoP = getLatest('https://anchor.fm/s/5cfb84c8/podcast/rss');
		// }
		const [post, course, article, cafeConTech] = await Promise.all(promises);
		let latest = [
			{
				/* post */ href: post.slug,
				image: post.banner,
				title: post.title,
				tag: 'Post'
			},
			{
				/* article*/
				href: article.url,
				image: article.image,
				title: article.title,
				tag: `published at: ${article.tag}`
			},
			{
				/* Cafe con Tech*/
				href: cafeConTech.url,
				image: cafeConTech.image,
				title: cafeConTech.title,
				tag: 'Podcast: Café con Tech'
			},
			// {
			// 	href: 'https://youtube.com/watch?v=' + youtube[0].id,
			// 	image: youtube[0].thumb.url,
			// 	title: youtube[0].title,
			// 	tag: `Youtube`
			// },
			{
				/* egghead */ href: course.url + '?af=4cexzz',
				image: course.image,
				title: course.title,
				tag: 'Egghead Course'
			}
		];
		if (lang === 'es') {
			const controlRemoto = await getLatest('https://anchor.fm/s/5cfb84c8/podcast/rss');
			latest = [
				...latest,
				{
					/* Control Remoto*/
					href: controlRemoto.url,
					image: controlRemoto.image,
					title: controlRemoto.title,
					tag: 'Podcast: Control Remoto'
				}
			];
		}

		return latest;
	} catch (e) {
		console.error(e);
		// @TODO Should it Throw?
		return [];
	}
}

export const load: PageServerLoad = async ({ cookies }) => {
	try {
		const lang = cookies.get('lang');

		const latestP = getLatestContent(lang);
		const favoritesP = getFavorites(lang);
		const featuredP = getCourses(lang);
		const [latest, favorites, courses] = await Promise.all([latestP, favoritesP, featuredP]);
		const featured = courses.find((item) => item.featured);
		return {
			latest,
			favorites,
			featured
		};
	} catch (e) {
		console.error(e);
		return {
			status: 500,
			errors: {
				error: new Error(e.message)
			}
		};
	}
};
import { CHATBOT_URL, CHATBOT_SECRET, OPENAI_API_KEY } from '$env/static/private';

const client = createClient(CHATBOT_URL, CHATBOT_SECRET!);
const dbConfig = {
	client,
	tableName: 'documents',
	queryName: 'match_documents'
};

const embeddings = new OpenAIEmbeddings({
	openAIApiKey: OPENAI_API_KEY
});
const llm = new OpenAI({
	temperature: 0,
	openAIApiKey: OPENAI_API_KEY,
	modelName: 'gpt-3.5-turbo'
});
export const actions = {
	setLang: async ({ cookies, request }) => {
		const data = await request.formData();
		const lang = data.get('lang');
		const location = data.get('location');
		locale.set(lang);
		cookies.set('lang', lang, { path: '/' });
		if (location) {
			throw redirect(303, location);
		}
		return {
			success: true
		};
	},

	search: async ({ request, cookies }) => {
		const lang = cookies.get('lang') === 'en' ? 'English' : 'Spanish'
		const formData = await request.formData();
		const question = formData.get('question');

		const store = await SupabaseVectorStore.fromExistingIndex(embeddings, dbConfig);
		const template = `You are the lovely assistant for the web who loves to help people!. 
Give the following sections from the content of the website, answer the question using only that information,
outputted in markdown format. 
All answers should link to the associated article.
All articles lives in https://matiashernandez.dev/blog/post.
Answer should be in {language}
Question: {query}`;
		const prompt = new PromptTemplate({ template, inputVariables: ['query', 'language'] });

		const chain = RetrievalQAChain.fromLLM(llm, store.asRetriever());
		const res = await chain.call({
			query: await prompt.format({ query: question, language: lang })
		});
		return { success: true, response: res.text };
	}
};

export const config = {
	isr: {
		expiration: 60
	}
};
