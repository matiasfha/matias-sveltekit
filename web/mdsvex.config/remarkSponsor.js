export function remarkSponsor() {
	return (node, file) => {
		if (file.filename.includes('blog')) {
			node.children = [
				...node.children.slice(0, 6),
				{
					type: 'html',
					value: '<Sponsor /> ',
				},
				...node.children.slice(6)
			];

			if (node.children.length > 30) {
				node.children = [
					...node.children.slice(0, 30),
					{
						type: 'html',
						value: '<Sponsor /> ',
					},
					...node.children.slice(30)
				];
			}
			if (node.children.length > 60) {
				node.children = [
					...node.children.slice(0, node.children.length),
					{
						type: 'html',
						value: '<Sponsor /> ',
					},
				];
			}
		}


	};
}
