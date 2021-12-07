<script lang="ts">
	import CtaButton from '$components/CtaButton.svelte';
	import { ethers } from 'ethers';
	import { onDestroy, onMount } from 'svelte';
	import abi from '../artifacts/src/contracts/WavePortal.sol/WavePortal.json';
	const contractAddress = '0xE48FD418B5970C3Ba7430014B44CcB4168498bd7';
	let currentAccount = null;
	let totalCount = 0;
	$: waiving = false;
	let allWaves = [];
	let message;
	let contract;

	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;
			if (!ethereum) {
				alert('There is no wallet!');
				return null;
			}
			const accounts = await ethereum.request({ method: 'eth_accounts' });
			if (accounts != null && Array.isArray(accounts)) {
				currentAccount = accounts[0];
			} else {
				console.log('No accounts found');
			}
		} catch (error) {
			console.error(error);
		}
	};

	const connectWeb3 = async () => {
		try {
			const { ethereum } = window;
			if (!ethereum) {
				alert('You need a wallet like Metamask');
			}
			const accounts = await ethereum.request({ method: 'eth_accounts' });
			if (accounts != null && Array.isArray(accounts)) {
				currentAccount = accounts[0];
				console.log('Connected to: ', currentAccount);
			} else {
				console.log('No accounts found');
			}
		} catch (error) {
			console.error(error);
		}
	};

	const onNewWave = (from, timestamp, message) => {
		allWaves = [
			...allWaves,
			{
				address: from,
				timestamp: new Date(timestamp * 1000),
				message
			}
		];
	};

	const onPrize = (from, timestamp) => {
		alert('You win the prize!!!');
	};

	const setupContract = async () => {
		const { ethereum } = window;
		await checkIfWalletIsConnected();
		if (ethereum && currentAccount) {
			// @ts-ignore
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			contract = new ethers.Contract(contractAddress, abi.abi, signer);
			contract.on('NewWave', onNewWave);
			contract.on('NewPrize', onPrize);
		}
	};

	const wave = async () => {
		try {
			const { ethereum } = window;
			if (ethereum && currentAccount) {
				waiving = true;
				/* Execute the contract */
				const waveTxn = await contract.wave(message, { gasLimit: 300000 });
				await waveTxn.wait();
				message = '';
			} else {
				console.log('Not reading', { ethereum, currentAccount });
				return null;
			}
		} catch (error) {
			console.error(error);
			alert('The wave was not sent. Try again later');
			return null;
		} finally {
			waiving = false;
		}
	};

	const getAllWaves = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const waves = await contract.getAllWaves();

				allWaves = waves.map((item) => {
					return {
						address: item.waver,
						timestamp: new Date(item.timestamp * 1000),
						message: item.message
					};
				});
				totalCount = allWaves.length;
			} else {
				console.log('No ethereum wallet present');
			}
		} catch (error) {
			console.error(error);
		}
	};

	onMount(async () => {
		await setupContract();
		await getAllWaves();
	});
	onDestroy(() => {
		contract?.off('NewWave', onNewWave);
	});
</script>

<div class="grid grid-cols-1 items-center justify-center gap-16 mt-12">
	<h1 class="text-5xl dark:text-white mx-auto">Hola Mundo! 🌍</h1>
	<p class="text-xl dark:text-white">
		Esta pagina es parte de un mini proyecto para aprender crypto development con Ethereum.
	</p>
	<p class="text-xl dark:text-white">
		El smart contract está disponible en <strong>Rinkeby</strong>.
	</p>

	{#if currentAccount == null}
		<button on:click={connectWeb3} class="p-8 text-lg bg-green-400 rounded-md w-60 mx-auto"
			>Connect to Web3</button
		>
	{:else}
		<div>
			<div>
				<input
					type="text"
					bind:value={message}
					class="border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-5 w-full dark:text-white bg-transparent border rounded-lg focus:outline-none disabled:cursor-not-allowed"
					placeholder="Tu Saludo"
					disabled={waiving}
				/>
				{#if waiving}
					<CtaButton text={`Mining the wave...`} onClick={wave} />
				{:else}
					<CtaButton
						text={`Envíame un crypto saludo 👋 Total waves until now: ${totalCount}`}
						onClick={wave}
					/>
				{/if}
			</div>
			<table
				class="table-auto mt-12 border-collapse border p-2  mb-12 rounded-md
        dark:bg-gray-200 
        border-ebony-clay-600 
        dark:border-gray-200 
        text-gray-300 dark:text-ebony-clay-600"
			>
				<thead>
					<tr>
						<th>Address</th>
						<th>Time</th>
						<th>Message</th>
					</tr>
				</thead>
				<tbody>
					{#each allWaves as wave}
						<tr>
							<td>{wave.address}</td>
							<td>{wave.timestamp.toString()}</td>
							<td>{wave.message}</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<h2 class="text-gray-600 dark:text-white text-md text-center font-body m-0 p-0">
				Connected to Web3: {currentAccount}
			</h2>
		</div>
	{/if}
</div>
