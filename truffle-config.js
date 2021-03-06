require("dotenv").config();
const HDWalletProvider = require("truffle-hdwallet-provider");
const path = require("path");

module.exports = {
  contracts_build_directory: path.join(__dirname, "frontend/src/contracts_main"),
  plugins: ["truffle-contract-size", "truffle-plugin-verify"],
  networks: {
    develop: {
      provider() {
        return new HDWalletProvider(
          process.env.GANACHE_MNEMONIC,
          "http://localhost:8545/"
        );
      },
      host: "localhost",
      port: 8545,
      network_id: 1337,
      gas: 6721975,
      gasPrice: 10000
    },    
    test: {
        provider() {
            return new HDWalletProvider(
            process.env.GANACHE_MNEMONIC,
            "http://localhost:8545/"
            );
        },
        host: "localhost",
        port: 8545,
        network_id: 1337,
        gas: 6721975,
        gasPrice: 1000000000
    },    
    mainnet: {
      provider() {
        // using wallet at index 1 ----------------------------------------------------------------------------------------v
        return new HDWalletProvider(
          process.env.MAINNET_PK,
          "https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY
        );
      },
      network_id: 1,
      //gas: 5561260,
      gasPrice: 75000000000 // 75 GWEI
    },
    rinkeby: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_PK,
          "https://rinkeby.infura.io/v3/" + process.env.INFURA_API_KEY
        );
      },
      network_id: 4,
      // gas: 4700000,
      gasPrice: 10000000000 // 10 GWEI
    },
    ropsten: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY
        );
      },
      network_id: 3,
      gasPrice: 10000000000, // 10 GWEI
      gas: 6721975
    },
    skale_testnet: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_PK,
         'https://dappnet-api.skalenodes.com/v1/beautiful-rasalgethi'
        );
      },
      gasPrice: 100000,
      network_id: "*"
    }
  },
  compilers: {
    solc: {
      version: "0.7.6",
      settings: {
        optimizer: {
          enabled: true, // Default: false
          runs: 1000 // Default: 200
        }
      }
    }
  },
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  }
};
