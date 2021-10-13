const nft = require('./nft/nft');
//const EcoFiERC1155 = artifacts.require("EcoFiERC1155");
const EcoFiERC1155 = artifacts.require("EcoFiCommunityERC1155");
const Web3 = require('web3');

//const NFTs = [75];
//const NFTs = [24, 27, 26, 25, 29, 30, 31, 42, 56, 57, 58, 59, 60];
//const NFTs = [25, 29, 30, 31, 42, 56, 57, 58, 59, 60];
const NFTs = [75, 74, 65, 55, 50, 49, 47, 43, 46, 41, 40, 39, 36, 35, 33, 34]; // communitys

//const contractAddress = '0x73a19aa8abFb73160949BB9FA10F846216970ac1'; // rinkeby
//const contractAddress = '0x8b4403B3a564B26Af27FFC5AF8fF4aEC774911C2'; // ropsten
//const contractAddress = '0xAc05D25C07BA4f7E3B38a5dE25B9F5D6CF233Af7'; // ropsten community
//const contractAddress = '0xA02A1d3A3Bb63F1CdEfFB2d23483C8a34258f247'; // mainnet
const contractAddress = '0x3d10755D249C05161D9aea30eb61be95E40dF90c'; // mainnte community
//const contractAddress = '0xe471A0951851C458390D51F2A591933a64eeB42c'; // rinkeby

module.exports = async function (deployer, network, accounts) {
  const contract = await EcoFiERC1155.at(contractAddress);
  const nonce_r = await nft.nonce(accounts[0]);

  const web3 = new Web3(deployer.provider);
  const signature = await web3.eth.sign(nonce_r.nonce, accounts[0]);

  const login_r = await nft.login(accounts[0], signature);

  try {

    var mintedNFTs = [];

    for (let index = 0; index < NFTs.length; index++) {
      const nftid = NFTs[index];
      try {
        
        const { newNft, oldNft } = await nft.newNft(nftid, login_r.accessToken, contractAddress);
        
        const addr = Web3.utils.toBN(accounts[0]);
        const time = Web3.utils.toBN(Date.now());
        const tokenId = `0x${addr.shln(96).add(time).toString(16)}`;

        let data = {
          tokenId,
          tokenURI: `/ipfs/${newNft.ipfsHash}`,
          supply: newNft.pieces,
          creators: [
            { account: accounts[0], value: 10000 }
          ],
          royalties: [
            { account: oldNft.createdByAddress, value: newNft.royalties * 100 }
          ]
        };

        const msgParams = JSON.stringify(data);

        const mm = await web3.eth.sign(msgParams, accounts[0]);

        let nftData = {
          ...data,
          signatures: [
            mm
          ]
        }

        let addresses = [];
        let amounts = [];

        oldNft.wallets.map(async wallet => {
          addresses.push(wallet.accountAddress);
          amounts.push(wallet.piecesInWallet);
        });

        console.log('Minting new:', newNft.idHyperobject, 'from old', oldNft.idHyperobject);
        const trans = await contract.batchMintAndTransfer(nftData, addresses, amounts);

        await nft.updateNft(newNft, trans.tx, tokenId, login_r.accessToken);

        mintedNFTs.push(newNft.idHyperobject);
      } catch (error) {
        console.log("Failed to mint ID", nftid);
      }
    }

    console.log("All minted", mintedNFTs);

    // const allow = await contract.
  } catch (e) {
    console.log(e);
    result = e;
  }
};