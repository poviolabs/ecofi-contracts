import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers} = hre;
  const {deploy} = deployments;

  const [deployer] = await ethers.getSigners();
  const from = await deployer.getAddress();

  await deploy('EcoFiExchangeV2', {
    from,
    gasLimit: 9500000,
    args: [],
    log: true
  });
};
export default func;
