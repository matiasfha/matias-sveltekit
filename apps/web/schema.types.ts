import type {
	SanityReference,
	SanityKeyedReference,
	SanityAsset,
	SanityImage,
	SanityFile,
	SanityGeoPoint,
	SanityBlock,
	SanityDocument,
	SanityImageCrop,
	SanityImageHotspot,
	SanityKeyed,
	SanityImageAsset,
	SanityImageMetadata,
	SanityImageDimensions,
	SanityImagePalette,
	SanityImagePaletteSwatch
} from 'sanity-codegen';

export type {
	SanityReference,
	SanityKeyedReference,
	SanityAsset,
	SanityImage,
	SanityFile,
	SanityGeoPoint,
	SanityBlock,
	SanityDocument,
	SanityImageCrop,
	SanityImageHotspot,
	SanityKeyed,
	SanityImageAsset,
	SanityImageMetadata,
	SanityImageDimensions,
	SanityImagePalette,
	SanityImagePaletteSwatch
};

/**
 * Navigation
 *
 *
 */
export interface Navigation extends SanityDocument {
	_type: 'navigation';

	/**
	 * Title — `string`
	 *
	 *
	 */
	title?: string;

	/**
	 * Navigation Id — `slug`
	 *
	 *
	 */
	navId?: { _type: 'navId'; current: string };

	/**
	 * Navigation items — `array`
	 *
	 *
	 */
	items?: Array<SanityKeyed<NavigationItem>>;
}

/**
 * Site Settings
 *
 *
 */
export interface SiteSettings extends SanityDocument {
	_type: 'siteSettings';

	/**
	 * Site Title — `string`
	 *
	 *
	 */
	title?: string;

	/**
	 * Site Description — `text`
	 *
	 *
	 */
	description?: string;

	/**
	 * Keywords — `array`
	 *
	 *
	 */
	keywords?: Array<SanityKeyed<string>>;

	/**
	 * URL — `url`
	 *
	 * The main site url.
	 */
	url?: string;

	/**
	 * Main navigation — `reference`
	 *
	 * Select menu for main navigation
	 */
	mainNav?: SanityReference<Navigation>;
}

/**
 * Favorites
 *
 *
 */
export interface Favorites extends SanityDocument {
	_type: 'favorites';

	/**
	 * Title — `string`
	 *
	 *
	 */
	title?: string;

	/**
	 * URL — `string`
	 *
	 *
	 */
	url?: string;

	/**
	 * Image — `image`
	 *
	 *
	 */
	image?: {
		_type: 'image';
		asset: SanityReference<SanityImageAsset>;
		crop?: SanityImageCrop;
		hotspot?: SanityImageHotspot;
	};

	/**
	 * Tag — `string`
	 *
	 *
	 */
	tag?: string;
}

/**
 * External Articles
 *
 *
 */
export interface ExternalArticles extends SanityDocument {
	_type: 'external-articles';

	/**
	 * Title — `string`
	 *
	 *
	 */
	title?: string;

	/**
	 * URL — `string`
	 *
	 *
	 */
	url?: string;

	/**
	 * Image — `image`
	 *
	 *
	 */
	image?: {
		_type: 'image';
		asset: SanityReference<SanityImageAsset>;
		crop?: SanityImageCrop;
		hotspot?: SanityImageHotspot;
	};

	/**
	 * Published — `datetime`
	 *
	 *
	 */
	published_at?: string;

	/**
	 * Tag — `string`
	 *
	 *
	 */
	tag?: string;

	/**
	 * Featured — `boolean`
	 *
	 *
	 */
	featured?: boolean;

	/**
	 * Description — `text`
	 *
	 *
	 */
	description?: string;
}

/**
 * Microbytes Courses
 *
 *
 */
export interface Microbytes extends SanityDocument {
	_type: 'microbytes';

	/**
	 * Course Title — `string`
	 *
	 *
	 */
	course?: string;

	/**
	 * Course Image — `image`
	 *
	 *
	 */
	image?: {
		_type: 'image';
		asset: SanityReference<SanityImageAsset>;
		crop?: SanityImageCrop;
		hotspot?: SanityImageHotspot;
	};

	/**
	 * Convertkit Id — `string`
	 *
	 *
	 */
	tagId?: string;

	/**
	 * Description — `array`
	 *
	 *
	 */
	description?: Array<SanityKeyed<SanityBlock>>;
}

/**
 * Page
 *
 *
 */
export interface Page extends SanityDocument {
	_type: 'page';

	/**
	 * Name — `string`
	 *
	 *
	 */
	name?: string;

	/**
	 * Content — `array`
	 *
	 *
	 */
	content?: Array<SanityKeyed<SanityBlock>>;

	/**
	 * Slug — `slug`
	 *
	 *
	 */
	slug?: { _type: 'slug'; current: string };
}

/**
 * Posts
 *
 *
 */
export interface Posts extends SanityDocument {
	_type: 'posts';

	/**
	 * Date — `date`
	 *
	 *
	 */
	date?: string;

	/**
	 * Cover Image — `image`
	 *
	 *
	 */
	banner?: {
		_type: 'image';
		asset: SanityReference<SanityImageAsset>;
		crop?: SanityImageCrop;
		hotspot?: SanityImageHotspot;

		/**
		 * Attribution — `string`
		 *
		 *
		 */
		bannerCredit?: string;
	};

	/**
	 * Keywords — `array`
	 *
	 *
	 */
	keywords?: Array<SanityKeyed<string>>;

	/**
	 * Title — `string`
	 *
	 *
	 */
	title?: string;

	/**
	 * Summary — `text`
	 *
	 *
	 */
	description?: string;

	/**
	 * Content — `array`
	 *
	 *
	 */
	content?: Array<SanityKeyed<SanityBlock>>;
}

export type Link = {
	_type: 'link';
	/**
	 * Internal Link — `reference`
	 *
	 * Select pages for navigation
	 */
	internalLink?: SanityReference<Page>;

	/**
	 * External URL — `url`
	 *
	 * Use fully qualified URLS for external link
	 */
	externalUrl?: string;
};

export type NavigationItem = {
	_type: 'navigationItem';
	/**
	 * Navigation Text — `string`
	 *
	 *
	 */
	text?: string;

	/**
	 * Navigation Item URL — `link`
	 *
	 *
	 */
	navigationItemUrl?: Link;
};

export type Documents =
	| Navigation
	| SiteSettings
	| Favorites
	| ExternalArticles
	| Microbytes
	| Page
	| Posts;
