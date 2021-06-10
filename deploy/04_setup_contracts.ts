import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const deployments = await hre.deployments.all();
  const exp = {
    name: hre.network.name,
    chainId: '1337',
    contracts: Object.entries(deployments).reduce((prev, [key, deployment]) => {
      return {
        ...prev,
        [key]: deployment
      }
    }, {})
  }
  //let out = '';
  /* for (const [key, deployment] of Object.entries(deployments)) {
    let contract = {

    }
    out += JSON.stringify(deployment.abi);
  } */

  fs.writeFileSync(
    contractsDir + "/all.json",
    JSON.stringify(exp, null, 2)
  );

  fs.writeFileSync(
    contractsDir + "/EcoToken.json",
    JSON.stringify(hre.artifacts.readArtifactSync("EcoFiToken"), null, 2)
  );

  fs.writeFileSync(
    contractsDir + "/SproutToken.json",
    JSON.stringify(hre.artifacts.readArtifactSync("SproutToken"), null, 2)
  );

  fs.writeFileSync(
    contractsDir + "/EcoFiERC1155.json",
    JSON.stringify(hre.artifacts.readArtifactSync("EcoFiERC1155"), null, 2)
  );

  fs.writeFileSync(
    contractsDir + "/EcoFiExchangeV2.json",
    JSON.stringify(hre.artifacts.readArtifactSync("EcoFiExchangeV2"), null, 2)
  );
};
export default func;
