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
  const erc20_p = deps['ERC20TransferProxy'];
  const nft_p = deps['NftTransferProxy'];
  const roy_p = deps['EcoRoyaltiesRegistry'];

  const exchangeContract = new ethers.Contract(contract.address, contract.abi);
  await exchangeContract.connect(deployer).__EcoExchangeV2_init(
    nft_p.address, 
    erc20_p.address,
    '50', // 0.5% exchange fee
    from,
    roy_p.address);

  const erc20ProxyContract = new ethers.Contract(erc20_p.address, erc20_p.abi);
  await erc20ProxyContract.connect(deployer).addOperator(contract.address);

  const nftProxyContract = new ethers.Contract(nft_p.address, nft_p.abi);
  await nftProxyContract.connect(deployer).addOperator(contract.address);

};
export default func;
