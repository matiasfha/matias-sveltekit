//
require("@nomiclabs/hardhat-waffle");
require('dotenv').config()
//import '@nomiclabs/hardhat-waffle'
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const rinkebyUrl  = process.env.RINKEBY_URL
const ropstenUrl = process.env.ROPSTEN_URL
const accounts = [`0x${process.env.ACCOUNT_SECRET}`]
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: './src/artifacts',
    sources: './src/contracts',
    tests: './tests/contracts'
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    rinkeby: {
      url:rinkebyUrl,
      accounts
    },
    ropsten: {
      url: ropstenUrl,
      accounts,
    }
  }
};
