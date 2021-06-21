import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers} = hre;
  const {deploy} = deployments;

  const [deployer] = await ethers.getSigners();
  const from = await deployer.getAddress();

  const contract = await deploy('EcoFiERC1155', {
    from,
    args: [],
    log: true
  });

  const deps = await deployments.all();
  const nft_p = deps['NftTransferProxy'];

  const mintContract = new ethers.Contract(contract.address, contract.abi);
  await mintContract.connect(deployer).__EcoFiERC1155_init('HypE', 'HYP', 'ipfs:/', 'https://hyp.eco', nft_p.address);
};
export default func;
