<script lang="ts">
	import Seo from '$components/Seo.svelte';
	import { useWeb3 } from 'svweb3';

	const { connect, subscribe } = useWeb3({
		init: () => {
			return Promise.resolve();
		}
	});

	let account = null;
	let isConnected = false;

	subscribe((state) => {
		({ account, isConnected } = state);
		console.log({ account, isConnected });
	});
</script>

<Seo
	title="Matias Hernández | Dao Project"
	keywords={['web3', 'solidity', 'crypto', 'ethers', 'ethereum', 'eth', 'dapp', 'dao']}
/>

<div class="grid grid-cols-1 items-center justify-center gap-16 mt-12">
	<h1 class="text-5xl dark:text-white mx-auto">Hola Mundo! 🌍</h1>
	<p class="text-xl dark:text-white">Pagina del proyecto DAO</p>
	{#if !isConnected}
		<button on:click={connect} class="p-8 text-lg bg-green-400 rounded-md w-60 mx-auto"
			>Connect to Web3</button
		>
	{:else}
		<p class="text-gray-600 dark:text-white text-lg text-center font-body m-0 p-0">
			Connected to Web3: {account}
		</p>
		<p class="text-gray-600 dark:text-white text-lg text-center font-body m-0 p-0">Balance: ETH</p>
	{/if}
</div>
