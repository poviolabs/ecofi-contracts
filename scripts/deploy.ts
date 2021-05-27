import { ethers } from 'hardhat';

require('dotenv').config()

const RINKEBY = "4";
/* const fs = require('fs');
const rfs = require('recursive-fs');
const fetch = require('node-fetch'); */

const func = async function () {
  /* const {ethers} = hre;
  console.log(hre); */

  const EcoFiExchangeV2 = await ethers.getContractFactory("EcoFiExchangeV2");
  const exc = await EcoFiExchangeV2.deploy();

  console.log("Exc deployed to:", exc.address);

  //const {deploy} = deployments;

  /* const GITHUB = "github";
  const PINATA = "pinata";
  const LOCAL = "local";
  const metadata_location = process.env.METADATA_LOCATION; //  github, pinata
  const PREDEFINED_GITHUB_GIST_ID = process.env.PREDEFINED_GITHUB_GIST_ID;

  const {deployer} = await getNamedAccounts();
  const network = await hre.ethers.get
 
  const TEMP_METADATA_DIR = './temp_metadata';
  const GIST_URL_PREFIX = "https://gist.github.com/raw/"

  let gistId;
  let contractUri;
  let baseMetadataUri;
  let contractName;
  let contractSymbol;

  // OpenSea proxy registry addresses for rinkeby and mainnet.
  let proxyRegistryAddress;
  if (network === RINKEBY) {
    proxyRegistryAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
  } else {
    proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
  }

  // GIT - get the contract parameters
  switch (metadata_location) {
    case GITHUB:

      let data; 
      // use the predefined key if it exists
      if (PREDEFINED_GITHUB_GIST_ID) {
        console.log("using predefined github gist: " + PREDEFINED_GITHUB_GIST_ID);

        gistId = PREDEFINED_GITHUB_GIST_ID;

        // pull the data
        let url = GIST_URL_PREFIX + PREDEFINED_GITHUB_GIST_ID;

        await fetch(url)
        .then((res:any) => res.json())
        .then((json:any) => {
          data = json;
        });
      }

      else // load it from the temp metadata files
      {
        let {files, dirs} = await rfs.read(TEMP_METADATA_DIR);
      
        // on clean run, dirs[1] should contain the directory
        gistId = dirs[1].split(TEMP_METADATA_DIR).pop().split("/")[1];
        console.log("found metadata on github gist: " + gistId);

        // files[0] should contain the contract uri file, read it and get the name and symbol
        data = JSON.parse(fs.readFileSync(files[0]).toString())
      }

      // set the uri details
      contractUri = GIST_URL_PREFIX + gistId;
      baseMetadataUri = contractUri + "/";
      contractName = data.name;
      contractSymbol = data.symbol;

    break;
  case PINATA:
      {
        const erc1155config = require('../temp_metadata/erc1155config.json');
        const contractconfig = require('../temp_metadata/contracturi.json')
        baseMetadataUri = erc1155config.gatewayUrl + "/" + erc1155config.metadataHash + "/";
        contractUri = erc1155config.gatewayUrl + "/" + erc1155config.contractUriHash;
        contractName = contractconfig.name;
        contractSymbol = contractconfig.symbol;
      }
      break;
    case LOCAL:
        {
          baseMetadataUri =  "http://localhost:3001/meta/";
          contractUri = "http://localhost:3001/contract";
          contractName = "Hype ECO Local";
          contractSymbol = "LOCSYM";
        }
        break;
  }

  console.log("------")
  console.log("metadata_location: " + metadata_location);
  console.log("Deployer: " + deployer);
  console.log("network: " + network);
  console.log("uri: " + contractUri);
  console.log("name: " + contractName);
  console.log("symbol: " + contractSymbol);
  console.log("------")

  await deploy('EcoFiERC1155', {
    from: deployer,
    args: [
      proxyRegistryAddress,
      contractUri,
      baseMetadataUri,
      contractName,
      contractSymbol
    ],
    log: true
  });

  await deploy('EcoFiExchangeV2', {
    from: deployer,
    gasLimit: 9500000,
    args: [],
    log: true
  }); */
};

export default func;
func.tags = ['EcoFiERC1155', 'EcoFiExchangeV2'];

func()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
