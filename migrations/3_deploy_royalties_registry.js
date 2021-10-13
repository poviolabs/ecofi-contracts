const ERC20TransferProxy = artifacts.require("ERC20TransferProxy");
const NftTransferProxy = artifacts.require("NftTransferProxy");
const EcoRoyaltiesRegistry = artifacts.require("EcoRoyaltiesRegistry");

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(EcoRoyaltiesRegistry,  {overwrite: false});
    const royaltiesRegistry = await EcoRoyaltiesRegistry.deployed();
    await royaltiesRegistry.__RoyaltiesRegistry_init();
};
