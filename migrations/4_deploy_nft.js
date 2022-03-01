const EcoFiERC1155 = artifacts.require("EcoFiERC1155");

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(EcoFiERC1155,  {overwrite: true});
    const nftC = await EcoFiERC1155.deployed();

    // name, symbol, baseURI (for file storage), contract URI (where the NFTs can be found), approved address (NFT transfer proxy)

    // Hype
    //await nftC.__EcoFiERC1155_init('HypE', 'HYP', 'ipfs:/', 'https://stg.hyp.eco', '0xF8fdEbC27ce16013A7F1582b5812Be394cca2d76'); // Ropsten
    //await nftC.__EcoFiERC1155_init('HypE', 'HYP', 'ipfs:/', 'https://stg.hyp.eco', '0x3026c12a297DB3eab4e89fFCCd1A7818a7Ca306f'); // Rinkeby
    //await nftC.__EcoFiERC1155_init('HypE', 'HYP', 'ipfs:/', 'https://hyp.eco', '0x9d523C3908Bfa05e19E124645E606977ff9B0400'); // Mainnet

    // Arius
    //await nftC.__EcoFiERC1155_init('Arius', 'ART', 'ipfs:/', 'https://stg.arius.one', '0x3026c12a297DB3eab4e89fFCCd1A7818a7Ca306f'); // Rinkeby
    //await nftC.__EcoFiERC1155_init('Arius', 'ART', 'ipfs:/', 'https://arius.one', '0x9d523C3908Bfa05e19E124645E606977ff9B0400'); // Mainnet

    // Raw
    //await nftC.__EcoFiERC1155_init('Raw', 'RAW', 'ipfs:/', 'https://stg.hyp.eco', '0x3026c12a297DB3eab4e89fFCCd1A7818a7Ca306f'); // Rinkeby

    // Tow
    //await nftC.__EcoFiERC1155_init('Title of Work', 'TOW', 'ipfs:/', 'https://stg.hyp.eco', '0x3026c12a297DB3eab4e89fFCCd1A7818a7Ca306f'); // Rinkeby

    // SKALE - beautiful-rasalgethi
    //await nftC.__EcoFiERC1155_init('HypE', 'HYP', 'ipfs:/', 'https://stg.hyp.eco', '0xcAA8ff8a8E93f1c17Cc59F70b129C49168631671'); // SKALE - beautiful-rasalgethi
    //await nftC.__EcoFiERC1155_init('Raw', 'RAW', 'ipfs:/', 'https://stg.hyp.eco', '0xcAA8ff8a8E93f1c17Cc59F70b129C49168631671'); // SKALE - beautiful-rasalgethi
    //await nftC.__EcoFiERC1155_init('Title of Work', 'TOW', 'ipfs:/', 'https://stg.hyp.eco', '0xcAA8ff8a8E93f1c17Cc59F70b129C49168631671'); // SKALE - beautiful-rasalgethi
};
