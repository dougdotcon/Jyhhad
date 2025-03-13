require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
   development: {
    host: "127.0.0.1",
    port: 8545,
    network_id: "*"
   },
   testnet: {
    provider: () => new HDWalletProvider(
      process.env.MNEMONIC,
      `https://data-seed-prebsc-1-s1.binance.org:8545`
    ),
    network_id: 97
   },
   mainnet: {
    provider: () => new HDWalletProvider(
      process.env.MNEMONIC,
      `https://bsc-dataseed.binance.org/`
    ),
    network_id: 56
   }
  },
  compilers: {
   solc: {
    version: "0.8.19",
    settings: {
      optimizer: {
       enabled: true,
       runs: 200
      }
    }
   }
  },
  plugins: [
   'truffle-plugin-verify'
  ],
  api_keys: {
   bscscan: process.env.BSCSCAN_API_KEY
  }
}; 