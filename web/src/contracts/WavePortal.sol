  // SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    // Mapping from address to uint
    mapping(address => uint) public waves;
    uint256 public totalWaves;

    constructor() {
        console.log("Yo yo, I am a contract and I am smart");
    }

    function wave() public {
        waves[msg.sender]+=1;
        totalWaves+=1;
        console.log("%s was saved", msg.sender);
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("We have %s total waves!", totalWaves);
        return totalWaves;
    }
    

}
