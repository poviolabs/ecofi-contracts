// SPDX-License-Identifier: MIT

pragma solidity >=0.6.2 <0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract BatchTransfer {
    /// @notice Tokens on the given ERC-1155 contract are transferred from you to the recipients.
    ///         Don't forget to execute setApprovalForAll first to authorize this contract.
    function batchTransfer(address contractAddress, address[] memory recipients, uint256[] memory tokenIds, uint256[] memory amounts) external {
        require(recipients.length > 0, "Recipients are not defined");
        require(
            recipients.length == tokenIds.length && tokenIds.length == amounts.length,
            "Invalid array data"
        );


        for (uint256 index; index < recipients.length; index++) {
            ERC1155(contractAddress).safeTransferFrom(msg.sender, recipients[index], tokenIds[index], amounts[index], "");
        }
    }
}