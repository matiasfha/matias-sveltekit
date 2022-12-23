export function processUrl(url, node) {
	if (node.tagName === "a") {
		node.properties.class = node.properties.class + " underlined";

		if (!url.href.startsWith("/")) {
			// Open external links in new tab
			node.properties.target = "_blank";
			// Fix a security concern with offsite links
			// See: https://web.dev/external-anchors-use-rel-noopener/
			node.properties.rel = "noreferrer noopener";
		}
	}
}
