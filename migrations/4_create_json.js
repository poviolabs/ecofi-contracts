const EcoFiERC1155 = artifacts.require("EcoFiERC1155");
const EcoFiExchangeV2 = artifacts.require("EcoFiExchangeV2");
const ERC20TransferProxy = artifacts.require("ERC20TransferProxy");
const NftTransferProxy = artifacts.require("NftTransferProxy");
const EcoRoyaltiesRegistry = artifacts.require("EcoRoyaltiesRegistry");
const fs = require("fs");

module.exports = async function (deployer, network, accounts) {
    const c1 = await EcoFiERC1155.at('0x09C36eD5D5beb7Fc2cA1400d084A74457EA742c2');
    const c2 = await EcoFiExchangeV2.at('0xCb8b2269BC070C5413AE464DFF9632C95540796d');


    const c3 = await ERC20TransferProxy.at('0x5651E54f9D2F8caa0Fd353a551Ded549F847A634');
    const c4 = await NftTransferProxy.at('0xF8fdEbC27ce16013A7F1582b5812Be394cca2d76');
    const c5 = await EcoRoyaltiesRegistry.at('0x62de4fb0349dCf979b5d6A2dCac2F4340D24282e');

    const contractsDir = __dirname + "/../frontend/src/contracts";

    const exp = {
        'EcoFiERC1155': {
            adress: c1.address,
            abi: c1.abi
        },
        'EcoFiExchangeV2': {
            adress: c2.address,
            abi: c2.abi
        },
        'ERC20TransferProxy': {
            adress: c3.address,
            abi: c3.abi
        },
        'NftTransferProxy': {
            adress: c4.address,
            abi: c4.abi
        },
        'EcoRoyaltiesRegistry': {
            adress: c5.address,
            abi: c5.abi
        }
    };

    fs.writeFileSync(
        contractsDir + "/exc_ropsten.json",
        JSON.stringify(exp, null, 2)
    );
};
