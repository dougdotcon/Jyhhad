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
        process.env.TESTNET_URL
      ),
      network_id: 97
    },
    mainnet: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC,
        process.env.MAINNET_URL
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