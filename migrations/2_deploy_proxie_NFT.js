const ERC20TransferProxy = artifacts.require("ERC20TransferProxy");
const NftTransferProxy = artifacts.require("NftTransferProxy");
const EcoRoyaltiesRegistry = artifacts.require("EcoRoyaltiesRegistry");

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(NftTransferProxy,  {overwrite: false});
    const nftTP = await NftTransferProxy.deployed();
    await nftTP.__NftTransferProxy_init();
};
