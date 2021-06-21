// SPDX-License-Identifier: MIT

pragma solidity >=0.6.2 <0.8.0;
pragma abicoder v2;

import "protocol-contracts/exchange-v2/contracts/ExchangeV2Core.sol";
import "protocol-contracts/exchange-v2/contracts/RaribleTransferManager.sol";
import "@rarible/royalties/contracts/IRoyaltiesProvider.sol";

contract EcoFiExchangeV2 is ExchangeV2Core, RaribleTransferManager {
    function __EcoExchangeV2_init(
        INftTransferProxy _transferProxy,
        IERC20TransferProxy _erc20TransferProxy,
        uint newProtocolFee,
        address payable newDefaultFeeReceiver,
        IRoyaltiesProvider newRoyaltiesProvider
    ) external initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __TransferExecutor_init_unchained(_transferProxy, _erc20TransferProxy);
        __RaribleTransferManager_init_unchained(newProtocolFee, newDefaultFeeReceiver, newRoyaltiesProvider);
        __OrderValidator_init_unchained();
    }
}
