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
  console.log("EcoFi signer: ", signer);

  const ecoToken: DeployResult = await deploy('EcoFiToken', {
    from,
    args: [signer],
    log: false
  });

  console.log("EcoFi token deployed to: ", ecoToken.address);

  const sproutToken = await deploy('SproutToken', {
    from,
    args: [ecoToken.address, signer],
    log: false
  });

  console.log("Sprout token deployed to: ", sproutToken.address);

  const ecoTokenContract = new ethers.Contract(ecoToken.address, ecoToken.abi, eco_multisig).connect(deployer);
  const sprtTokenContract = new ethers.Contract(sproutToken.address, sproutToken.abi, eco_multisig).connect(deployer);

  // Set sprout contract address in ECO contract (to prevent accidental transfer())
  await ecoTokenContract.setSproutAddress(sproutToken.address);
  console.log("Set SproutToken address in EcoFiToken contract");

  const tx = await ecoTokenContract.connect(eco_multisig)
      .transfer(
        from,
        ethers.BigNumber.from("1000000000000000000000"),
      );
    await tx.wait();

  const tx1 = await sprtTokenContract.connect(eco_multisig)
    .transfer(
      from,
      ethers.BigNumber.from("1000000000000000000000"),
    );
  await tx1.wait();
};
export default func;
