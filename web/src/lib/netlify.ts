import { NetlifyAPI } from 'netlify';

const token = import.meta.env.VITE_NETLIFY_TOKEN;
const client = new NetlifyAPI(token);

// The polling function
function poll(fn: () => void) {
	const endTime = Number(new Date()) + 2000;
	const interval = 1000;

	const checkCondition = function (resolve, reject) {
		// If the condition is met, we're done!
		const result = fn();
		if (result) {
			resolve(result);
		}
		// If the condition isn't met but the timeout hasn't elapsed, go again
		else if (Number(new Date()) < endTime) {
			setTimeout(checkCondition, interval, resolve, reject);
		}
		// Didn't match and too much time, reject!
		else {
			reject(new Error('timed out for ' + fn + ': ' + arguments));
		}
	};

	return new Promise(checkCondition);
}

export async function getDeployStatus() {
	try {
		const deployList = await client.listSiteDeploys({
			siteId: 'fc23c69d-0768-4412-be6f-a50ec4e4531c'
		});
		const deploy = deployList[0];

		const result = await poll(async () => {
			const state = await client.getSiteDeploy({
				siteId: 'fc23c69d-0768-4412-be6f-a50ec4e4531c',
				deployId: deploy.id
			});

			return state.state === 'ready';
		});
		return result;
	} catch (e) {
		console.error(e);
	}
}
