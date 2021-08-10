const EcoFiERC1155 = artifacts.require("EcoFiERC1155");

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(EcoFiERC1155,  {overwrite: false});
    const nftC = await EcoFiERC1155.deployed();
    await nftC.__EcoFiERC1155_init('HypE', 'HYP', 'ipfs:/', 'https://stg.hyp.eco', '0xF8fdEbC27ce16013A7F1582b5812Be394cca2d76');
    // name, symbol, baseURI (for file storage), contract URI (where the NFTs can be found), approved address (NFT transfer proxy)
};
