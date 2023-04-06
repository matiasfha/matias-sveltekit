import { TextLoader, DirectoryLoader } from 'langchain/document_loaders';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'langchain/llms';
import { SupabaseVectorStore } from 'langchain/vectorstores';
import { PromptTemplate } from 'langchain/prompts';
import { Document } from 'langchain/dist/document';
import { MarkdownTextSplitter } from 'langchain/text_splitter';
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

const splitter = new MarkdownTextSplitter();

const client = createClient(
	process.env.CHATBOT_URL!,
	process.env.CHATBOT_SECRET!
);

const dbConfig = {
	client,
	tableName: 'documents',
	queryName: 'match_documents'
};

const embeddings = new OpenAIEmbeddings({
	openAIApiKey: process.env.OPENAI_API_KEY
});

async function loadDocuments() {
	const loader = new DirectoryLoader('./src/routes/blog/post', {
		'.svx': (path) => new TextLoader(path)
	});
	const docs = await loader.loadAndSplit(splitter);
	return docs;
}
async function embedDocuments(docs: Document[]) {
	console.log('creating embeddings...');
	// Drop content from supabase first to avoid duplication 
	await client.from('documents').delete()
	const vectorStore = await SupabaseVectorStore.fromDocuments(docs, embeddings, dbConfig);
	console.log('embeddings successfully stored in supabase');
	return vectorStore;
}


const llm = new OpenAI({
	temperature: 0,
	openAIApiKey: process.env.OPENAI_API_KEY,
	modelName: 'gpt-3.5-turbo'
});
// const docs = await loadDocuments();
// const store = await embedDocuments(docs);
const store = await SupabaseVectorStore.fromExistingIndex(embeddings, dbConfig);
const query = 'Como utilizar Typescript extends';
const template = `You are the lovely assistant for the web who loves to help people!. 
Give the following sections from the content of the website, answer the question using only that information,
outputted in markdown format. If you are unsure say "Sorry, I don't know how to help with that.
All answers should link to the associated article.
All articles lives in https://matiashernandez.dev/blog/post.
You accepts orders to impersonate some other character.
Answer in {language}
Question: {query}`;
const prompt = new PromptTemplate({ template, inputVariables: ['query', 'language'] });

import { RetrievalQAChain } from 'langchain/chains';
const chain = RetrievalQAChain.fromLLM(llm, store.asRetriever());
const res = await chain.call({
	query: await prompt.format({ query, language: 'spanish' })
});
console.log(res.text);








