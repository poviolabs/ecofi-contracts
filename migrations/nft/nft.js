const axios = require('axios');
//const API_URL = "https://api.stg.hyp.eco";
const API_URL = "http://10.0.0.199:3001";

const nonce = async function (publicAddress) {
    const details = await axios.get(`${API_URL}/account/nonce`,{params: {publicAddress}});
    console.log(details.data);
    return details.data;
}

const login = async function (publicAddress, signature) {
    const details = await axios.get(`${API_URL}/account/auth/login`,{params: {publicAddress, signature}});
    console.log(details.data);
    return details.data;
}

const newNft = async function (nftId, accessToken, contractAddress) {

    const getResponse = await axios.get(`${API_URL}/hyperobject/${nftId}`);
    const nft = getResponse.data;

    const getIpfsData = await axios.get(nft.nftToken);
    const ipfsData = getIpfsData.data;

    const createResponse = await axios.post(`${API_URL}/hyperobject/new`, {
      categoryId: nft.idCategory,
      artistId: nft.artist.idArtist,
      mediumId: nft.mediumId,
      artistName: nft.artistName,
      description: nft.description,
      notes: nft.notes,
      name: nft.name,
      photo: nft.photo,
      photoSmall: nft.photoSmall,
      photoMedium: nft.photoMedium,
      photoIpfs: ipfsData.image,
      pieces: nft.pieces,
      isDigital: nft.isDigital,
      width: Number(nft.width),
      height: Number(nft.height),
      yearOfArtworkCreation: nft.yearOfArtworkCreation,
      royalties: Number(nft.royalties),
      unit: nft.unit,
      contractAddress,
      //contractAddress: '0xA02A1d3A3Bb63F1CdEfFB2d23483C8a34258f247' // mainnet ecofi
      //contractAddress: '0x3d10755D249C05161D9aea30eb61be95E40dF90c' // mainnet ecofi community
    }, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    //return {newNft: nft, oldNft: nft};
    return {newNft: createResponse.data, oldNft: nft};
}

const updateNft = async function (newNft, transactionId, tokenId, accessToken) {
    await axios.patch(`${API_URL}/hyperobject/update-ids/${newNft.idHyperobject}`, {
        transactionId,
        tokenId,
    }, {
        headers: {
        "Authorization": `Bearer ${accessToken}`
        }
    });
}

module.exports = {
    login,
    nonce,
    newNft,
    updateNft
}