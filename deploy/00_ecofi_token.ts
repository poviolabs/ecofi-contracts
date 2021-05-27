import { DeployResult } from 'hardhat-deploy/dist/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers} = hre;
  const {deploy} = deployments;

  const [deployer, eco_multisig] = await ethers.getSigners();

  const from = await deployer.getAddress();
  const signer = await eco_multisig.getAddress();

  /* const SproutToken = await ethers.getContractFactory("SproutToken");
  const sproutToken1: Contract = await SproutToken.deploy('ecoToken.address', await eco_multisig.getAddress()); */

  const ecoToken: DeployResult = await deploy('EcoFiToken', {
    from,
    args: [signer],
    log: true
  });

  console.log("EcoFi token deployed to: ", ecoToken.address);

  const sproutToken = await deploy('SproutToken', {
    from,
    args: [ecoToken.address, signer],
    log: true
  });

  console.log("Sprout token deployed to: ", sproutToken.address);

  const ecoTokenContract = new ethers.Contract(ecoToken.address, ecoToken.abi, eco_multisig);

  // Set sprout contract address in ECO contract (to prevent accidental transfer())
  await ecoTokenContract.connect(deployer).setSproutAddress(sproutToken.address);
  console.log("Set SproutToken address in EcoFiToken contract");
};
export default func;
