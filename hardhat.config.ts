import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "./tasks/addresses";


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  solidity: {
    compilers:
    [
      { version: "0.5.12", settings: {} },
      { version: "0.6.8", settings: {} },
      { version: "0.7.5", settings: {} },
      { version: "0.8.0", settings: {} }
    ],
  },
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
      blockGasLimit: 0x1fffffffffffff
    },
  }
};
