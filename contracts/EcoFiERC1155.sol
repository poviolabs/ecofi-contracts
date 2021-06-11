// SPDX-License-Identifier: MIT

pragma solidity >=0.6.2 <0.8.0;
pragma abicoder v2;

import "protocol-contracts/tokens/contracts/erc-1155/ERC1155Base.sol";

import "hardhat/console.sol";
import "./lib/ERC1155Image.sol";

contract EcoFiERC1155 is ERC1155Base, ERC1155Image {
    event CreateEcoFiERC1155(address owner, string name, string symbol);

    function __EcoFiERC1155_init(string memory _name, string memory _symbol, string memory baseURI, string memory contractURI) external initializer {
        __Ownable_init_unchained();
        __ERC1155Lazy_init_unchained();
        __ERC165_init_unchained();
        __Context_init_unchained();
        __Mint1155Validator_init_unchained();
        __ERC1155_init_unchained("");
        __HasContractURI_init_unchained(contractURI);
        __ERC1155Burnable_init_unchained();
        __RoyaltiesV2Upgradeable_init_unchained();
        __ERC1155Base_init_unchained(_name, _symbol);
        _setBaseURI(baseURI);
        _setDefaultApproval(_msgSender(), true); // set the contract deployer as approved
        emit CreateEcoFiERC1155(_msgSender(), _name, _symbol);
    }

    function mintWithImage(LibERC1155LazyMint.Mint1155Data memory data, string memory image, address to, uint256 _amount) public virtual {
        address minter = address(data.tokenId >> 96);
        address sender = _msgSender();

        require(minter == data.creators[0].account, "tokenId incorrect");
        require(data.creators.length == data.signatures.length);
        require(minter == sender || isApprovedForAll(minter, sender), "ERC1155: transfer caller is not approved");

        require(data.supply > 0, "supply incorrect");
        require(_amount > 0, "amount incorrect");
        require(bytes(data.uri).length > 0, "uri should be set");

        if (_getSupply(data.tokenId) == 0) {
            for (uint i = 0; i < data.creators.length; i++) {
                validate(sender, data, i);
            }

            _saveSupply(data.tokenId, data.supply);
            _saveRoyalties(data.tokenId, data.royalties);
            _saveCreators(data.tokenId, data.creators);
            _setTokenURI(data.tokenId, data.uri);
            _setTokenImage(data.tokenId, image);
        }

        _mint(to, data.tokenId, _amount, "");
    }
    uint256[50] private __gap;
}
