export interface Course {
	url: string;
	slug: string;
	title: string;
	watched_count: number;
	created_at: string;
	description: string;
	duration: number;
	image: string;
	access_state: string;
	id: number;
	tags: Array<{ name: string }>;
}
export interface FeedItem {
	title: string;
	pubDate: string;
	contentSnippet: string;
	isoDate: string;
	itunes: {
		duration: number;
		image: string;
		season: string;
		episode: string;
		keywords: string;
	};
}

export type PodcastItem = Omit<FeedItem, 'itunes | isoDate'> & {
	url: string;
	duration: number;
	image: string;
	season: string;
	episode: string;
	keywords: string;
};

export interface Latest {
	href: string;
	title: string;
	image: string;
	tag: string;
}

export interface ContentElement {
	url: string;
	title: string;
	image: string;
	tag: string;
	featured?: boolean;
	description?: string;
}

export interface Post {
	date: string;
	banner: string;
	keywords: string[];
	title: string;
	description: string;
	tag: 'Post' | 'Seed';
	slug: string;
	featured?: boolean;
}
