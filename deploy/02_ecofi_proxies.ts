import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers} = hre;
  const {deploy} = deployments;

  const [deployer] = await ethers.getSigners();
  const from = await deployer.getAddress();

  const erc20_p = await deploy('ERC20TransferProxy', {
    from,
    gasLimit: 9500000,
    args: [],
    log: true
  });

  const nft_p = await deploy('NftTransferProxy', {
    from,
    gasLimit: 9500000,
    args: [],
    log: true
  });

  const erc20ProxyContract = new ethers.Contract(erc20_p.address, erc20_p.abi);
  await erc20ProxyContract.connect(deployer).__ERC20TransferProxy_init();

  const nftProxyContract = new ethers.Contract(nft_p.address, nft_p.abi);
  await nftProxyContract.connect(deployer).__NftTransferProxy_init();
};
export default func;
