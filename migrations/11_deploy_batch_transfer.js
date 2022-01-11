const BatchTransfer = artifacts.require("BatchTransfer");

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(BatchTransfer,  {overwrite: true});
    await BatchTransfer.deployed();
};
