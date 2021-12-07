// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import 'hardhat/console.sol';

contract WavePortal {
	/*s
	 * It will log the information of the parameters
	 * The information is saved as part of the transactions inside the block
	 */
	event NewWave(address indexed from, uint256 timestamp, string message);

	event NewPrize(address indexed from, uint256 timestamp);

	struct Wave {
		address waver;
		string message;
		uint256 timestamp;
	}

	Wave[] waves;

	uint256 public totalWaves;
	uint256 private seed; //randomess seed

	/*
	 * This is an address => uint mapping, meaning I can associate an address with a number!
	 * In this case, I'll be storing the address with the last time the user waved at us.
	 */
	mapping(address => uint256) public lastWavedAt;

	constructor() payable {
		console.log('Yo yo, I am a contract and I am smart');
		generateSeed();
	}

	function generateSeed() private {
		/*
		 * Set the initial seed
		 */
		seed = (block.timestamp + block.difficulty) % 100;
	}

	function coolDown() private {
		/*
		 * We need to make sure the current timestamp is at least 15-minutes bigger than the last timestamp we stored
		 */
		require(lastWavedAt[msg.sender] + 15 minutes < block.timestamp, 'Wait 15m');
		/*
		 * Update the current timestamp we have for the user
		 */
		lastWavedAt[msg.sender] = block.timestamp;
	}

	function wave(string memory _message) public {
		coolDown();
		totalWaves += 1;
		console.log('%s was saved', msg.sender, _message);
		waves.push(Wave(msg.sender, _message, block.timestamp));
		emit NewWave(msg.sender, block.timestamp, _message);

		generateSeed();
		if (seed <= 50) {
			//send eth to the waveer
			uint256 prizeAmount = 0.0001 ether;
			require(
				prizeAmount <= address(this).balance,
				'Trying to withdraw more money that the contract has'
			);
			(bool success, ) = (msg.sender).call{value: prizeAmount}('');
			require(success, 'Failed to withdraw money from contract');
			emit NewPrize(msg.sender, block.timestamp);
		}
	}

	function getAllWaves() public view returns (Wave[] memory) {
		return waves;
	}

	function getTotalWaves() public view returns (uint256) {
		return totalWaves;
	}
}
