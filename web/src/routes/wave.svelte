<script lang="ts">
	import CtaButton from '$components/CtaButton.svelte';
	import { ethers } from 'ethers';
	import { onMount } from 'svelte';
	import abi from '../artifacts/src/contracts/WavePortal.sol/WavePortal.json';
	const contractAddress = '0x37033090a87353d527C58d03CB489f7D641a6b53';
	$: currentAccount = null;
	$: totalCount = 0;
	$: waiving = false;
	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;
			if (!ethereum) {
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
	const wave = async () => {
		try {
			const { ethereum } = window;
			if (ethereum && currentAccount) {
				waiving = true;
				// @ts-ignore
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(contractAddress, abi.abi, signer);

				/* Execute the contract */
				const waveTxn = await wavePortalContract.wave();
				await waveTxn.wait();
				const count = await wavePortalContract.getTotalWaves();
				totalCount = count.toNumber();
			} else {
				console.log('Not reading', { ethereum, currentAccount });
				return null;
			}
		} catch (error) {
			console.error(error);
			return null;
		} finally {
			waiving = false;
		}
	};

	const getTotalWaves = async () => {
		try {
			const { ethereum } = window;
			if (ethereum && currentAccount) {
				// @ts-ignore
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(contractAddress, abi.abi, signer);

				const count = await wavePortalContract.getTotalWaves();
				totalCount = count.toNumber();
			} else {
				console.log('Not reading', { ethereum, currentAccount });
			}
		} catch (error) {
			console.error(error);
		}
	};

	onMount(async () => {
		await checkIfWalletIsConnected();
		await getTotalWaves();
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
			{#if waiving}
				<CtaButton text={`Mining the wave...`} onClick={wave} />
			{:else}
				<CtaButton
					text={`Envíame un crypto saludo 👋 Total waves until now: ${totalCount}`}
					onClick={wave}
				/>
			{/if}
			<h2 class="text-gray-600 dark:text-white text-md text-center font-body m-0 p-0">
				Connected to Web3: {currentAccount}
			</h2>
		</div>
	{/if}
</div>
