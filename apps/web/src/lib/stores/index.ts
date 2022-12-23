import { get, writable } from 'svelte/store';
const createWritableStore = (key: string, startValue: string | Record<string, unknown>) => {
	const { subscribe, set } = writable(startValue);

	return {
		subscribe,
		set,
		get: () => JSON.parse(localStorage.getItem(key)),
		useLocalStorage: () => {
			const json = localStorage.getItem(key);
			if (json) {
				set(JSON.parse(json));
			}

			subscribe((current) => {
				localStorage.setItem(key, JSON.stringify(current));
			});
		}
	};
};

export const theme = createWritableStore('theme', { theme: 'dark' });
