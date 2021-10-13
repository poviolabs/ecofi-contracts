const EcoFiExchangeV2 = artifacts.require("EcoFiExchangeV2");
const ERC20TransferProxy = artifacts.require("ERC20TransferProxy");
const NftTransferProxy = artifacts.require("NftTransferProxy");

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(EcoFiExchangeV2,  {overwrite: false});
    const excC = await EcoFiExchangeV2.deployed();
    /* await excC.__EcoExchangeV2_init(
        '0xF8fdEbC27ce16013A7F1582b5812Be394cca2d76', // NFT transfer proxy
        '0x5651E54f9D2F8caa0Fd353a551Ded549F847A634', // ERC20 token trasfer proxy
        '50', // 0.5% exchange fee
        '0x117B9F2E941A8BF113C10554B8d7899a55dbf712', // default fee reciever
        '0x62de4fb0349dCf979b5d6A2dCac2F4340D24282e'); // royalties provider contract */
    await excC.__EcoExchangeV2_init( // Rinkeby
        '0x3026c12a297DB3eab4e89fFCCd1A7818a7Ca306f', // NFT transfer proxy
        '0x5871aA6C3e1fd3B7ef493285E94d860180368546', // ERC20 token trasfer proxy
        '50', // 0.5% exchange fee
        '0x117B9F2E941A8BF113C10554B8d7899a55dbf712', // default fee reciever
        '0x152fDa837bB7A01f670DcBdcF81EDA4B1EC2d2d3'); // royalties provider contract

    
    //const nftTP = await NftTransferProxy.at('0xF8fdEbC27ce16013A7F1582b5812Be394cca2d76');
    const nftTP = await NftTransferProxy.at('0x3026c12a297DB3eab4e89fFCCd1A7818a7Ca306f'); // rinkeby
    await nftTP.addOperator(excC.address);

    //const erc20TP = await ERC20TransferProxy.at('0x5651E54f9D2F8caa0Fd353a551Ded549F847A634');
    const erc20TP = await ERC20TransferProxy.at('0x5871aA6C3e1fd3B7ef493285E94d860180368546'); // rinkeby
    await erc20TP.addOperator(excC.address);
    
   
};
