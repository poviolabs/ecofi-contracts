const EcoFiERC1155 = artifacts.require("EcoFiERC1155");

module.exports = async function (deployer, network, accounts) {
    const nftC = await EcoFiERC1155.at('0xc4482e57EcF3E6a33ED5147Fa2142DD0a9f1272D');
    await nftC.__EcoFiERC1155_init('HypE', 'HYP', 'ipfs:/', 'https://hyp.eco', '0x9d523C3908Bfa05e19E124645E606977ff9B0400');
    // name, symbol, baseURI (for file storage), contract URI (where the NFTs can be found), approved address (NFT transfer proxy)
};
