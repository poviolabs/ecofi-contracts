import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers} = hre;
  const {deploy} = deployments;

  const [deployer] = await ethers.getSigners();
  const from = await deployer.getAddress();

  const contract = await deploy('EcoFiExchangeV2', {
    from,
    gasLimit: 9500000,
    args: [],
    log: true
  });

  const deps = await deployments.all();
  const erc1155 = deps['EcoFiERC1155'];
  const erc20_p = deps['ERC20TransferProxy'];
  const nft_p = deps['NftTransferProxy'];

  const exchangeContract = new ethers.Contract(contract.address, contract.abi);
  await exchangeContract.connect(deployer).__EcoExchangeV2_init(
    nft_p.address, 
    erc20_p.address,
    '10000', 
    from,
    deps['EcoFiERC1155'].address);

  const erc20ProxyContract = new ethers.Contract(erc20_p.address, erc20_p.abi);
  await erc20ProxyContract.connect(deployer).addOperator(contract.address);

  const nftProxyContract = new ethers.Contract(nft_p.address, nft_p.abi);
  await nftProxyContract.connect(deployer).addOperator(contract.address);

  const nftContract = new ethers.Contract(erc1155.address, erc1155.abi);
  // await nftContract.connect(deployer).transferOwnership(nft_p.address);
  await nftContract.connect(deployer).setApprovalForAll(nft_p.address, true);
};
export default func;
