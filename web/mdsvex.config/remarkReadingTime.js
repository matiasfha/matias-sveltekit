import getReadingTime from "reading-time";
import { visit } from "unist-util-visit";

export function remarkReadingTime() {
	return async function (info, file) {
		let text = "";
		visit(info, ["text", "code"], (node) => {
			text += node.value;
		});
		if (file.data.fm !== undefined) {
			file.data.fm['readingTime'] = getReadingTime(text);
		} else {
			console.error(file);
		}

	};
}
