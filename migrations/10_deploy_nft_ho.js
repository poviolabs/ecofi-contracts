const EcoFiERC1155 = artifacts.require("EcoFiHOERC1155");

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(EcoFiERC1155,  {overwrite: true});
    const nftC = await EcoFiERC1155.deployed();
    //await nftC.__EcoFiHOERC1155_init('HYPEROBJECT', 'OBJ', 'ipfs:/', 'https://stg.hyperobject.ecofi.io/', '0xF8fdEbC27ce16013A7F1582b5812Be394cca2d76'); // Ropsten
    //await nftC.__EcoFiHOERC1155_init('HYPEROBJECT', 'OBJ', 'ipfs:/', 'https://stg.hyperobject.ecofi.io/', '0x3026c12a297DB3eab4e89fFCCd1A7818a7Ca306f'); // Rinkeby
    //await nftC.__EcoFiHOERC1155_init('HYPEROBJECT', 'OBJ', 'ipfs:/', 'https://hyperobject.ecofi.io/', '0x9d523C3908Bfa05e19E124645E606977ff9B0400'); // Mainnet
    //await nftC.__EcoFiHOERC1155_init('HYPEROBJECT', 'OBJ', 'ipfs:/', 'https://stg.hyperobject.ecofi.io/', '0xcAA8ff8a8E93f1c17Cc59F70b129C49168631671'); // SKALE - beautiful-rasalgethi

    // name, symbol, baseURI (for file storage), contract URI (where the NFTs can be found), approved address (NFT transfer proxy)
};
