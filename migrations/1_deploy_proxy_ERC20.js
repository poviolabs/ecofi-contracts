const ERC20TransferProxy = artifacts.require("ERC20TransferProxy");
const NftTransferProxy = artifacts.require("NftTransferProxy");
const EcoRoyaltiesRegistry = artifacts.require("EcoRoyaltiesRegistry");

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(ERC20TransferProxy,  {overwrite: false});
    const erc20TP = await ERC20TransferProxy.deployed();
    await erc20TP.__ERC20TransferProxy_init();
};
