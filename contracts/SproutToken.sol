// SPDX-License-Identifier: AGPL-3.0-only
// (EcoFi) Sprout Token Contract
// Copyright (C) 2021
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./WadRayMath.sol";

/**
 * @title Sprout Token (SPRT)
 * @notice Customized implementation of OpenZepplin's ERC20Burnable Token with custom burn and staking mechanism.
 */
contract SproutToken is ERC20Burnable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    using WadRayMath for uint256;

    // Constants
    uint256 internal constant SECONDS_PER_YEAR = 365.25 days;
    uint256 internal constant MIN_STAKE_DURATION_SECONDS = 7776000; // in seconds ~90 days
    uint256 internal constant GENERATION_RATE = 2*1e27; // rate in ray (200%/year)
    uint256 internal constant GENERATION_BONUS_PER_SECOND = 1584404390701447512; // per second in ray (~100% after 20 years)
    uint256 internal constant MAX_BONUS_PERIOD_SECONDS_RAY = 631152000*1e27; // 20 years in seconds in ray
    
    // Address of the token contract used for staking
    address internal mEcoFiTokenContract;
    // EcoFi address
    address internal mEcoFi;
    // Reserve pool balance
    mapping(address => uint256) internal mReservePool;
    // Staker address mapped to last deosit (lockup) date
    mapping(address => uint256) internal mLastDeposit;
    // Staker address mapped to last mint (issue) date
    mapping(address => uint256) internal mLastMint;
    // Staker address mapped to balance
    mapping(address => uint256) internal mStakeBalance;

    /**
     * @notice Constructor
     * @param _baseTokenContract The contract address of the token which will be staked to generate sprout
     * @param _ecoFiAddress EcoFi address where company generation share will be sent
     */
    constructor(
        address _baseTokenContract,
        address _ecoFiAddress
    ) ERC20("Sprout Token", "SPRT")
    {
        mEcoFiTokenContract = _baseTokenContract; // ECO token contract address
        mEcoFi = _ecoFiAddress; // ECO address for generation share
        _mint(_ecoFiAddress, 10*10**6*10**18);
    }

    /**
     * @notice Overload OpenZepplin internal _transfer() function to add extra require statement preventing
     * transferring tokens to the contract address
     * @param _sender The senders address
     * @param _recipient The recipients address
     * @param _amount Amount of tokens to transfer (in wei units)
     * @dev Moves tokens `amount` from `sender` to `recipient`.
     *
     * Additional requirements:
     *
     * - `_recipient` cannot be the token contract address.
     */
    function _transfer(address _sender, address _recipient, uint256 _amount) internal override {
        require(_recipient != address(this), "SproutToken: transfer to token contract");
        require(_recipient != mEcoFiTokenContract, "SproutToken: transfer to ECO token contract");
        generateTokensFromStake();
        super._transfer(_sender, _recipient, _amount);
    }

    /**
    * @notice Computes the interest rate at the given rate from the given deposit time.
    * @param _rate the base interest rate in ray
    * @param _lastDepositTimestamp the timestamp of the last deposit (& withdraw for now TODO)
    * @return the raw interest rate which depends on the last deposit time
    * @dev The returned rate varies from 200% (before 90 days) and 
    * @dev 300% (20 years and up) and is linear between those points.
    */
    function rawGenerationRate(uint256 _rate, uint256 _lastDepositTimestamp)
        public
        view
        returns (uint256)
    {
        //solium-disable-next-line
        uint256 generationPeriodTimeDifference = block.timestamp - _lastDepositTimestamp;

        // calculate long duration staking bonus
        if(generationPeriodTimeDifference > MIN_STAKE_DURATION_SECONDS){
            uint256 bonusPeriod = generationPeriodTimeDifference.sub(MIN_STAKE_DURATION_SECONDS).mul(1e27); // current bonus period in seconds in ray
            if(bonusPeriod > MAX_BONUS_PERIOD_SECONDS_RAY){
                // max bonus period 20yrs
                bonusPeriod = MAX_BONUS_PERIOD_SECONDS_RAY;
            }

            return _rate.add(GENERATION_BONUS_PER_SECOND.rayMul(bonusPeriod));
        }
        return _rate;
    }

    /**
    * @dev function to calculate the interest using a linear interest rate formula
    * @param _rate the interest rate, in ray
    * @param _lastDepositTimestamp the timestamp of the last deposit (& withdraw for now TODO)
    * @param _lastMintTimestamp the timestamp of the last mint
    * @return the interest rate linearly accumulated during the timeDelta, in ray
    **/
    function calculateGenerationRate(uint256 _rate, uint256 _lastDepositTimestamp, uint256 _lastMintTimestamp)
        internal
        view
        returns (uint256)
    {
        //solium-disable-next-line
        uint256 mintTimeDifference = block.timestamp - _lastMintTimestamp;
        uint256 timeDelta = mintTimeDifference.wadToRay().rayDiv(SECONDS_PER_YEAR.wadToRay());
        
        return rawGenerationRate(_rate, _lastDepositTimestamp).rayMul(timeDelta);
    }


    function calculateTokenGeneration(address _account)
        internal
        view
        returns (uint256, uint256)
    {
        // calculate amount of SPRT to mint
        uint256 calculatedGenerationRate = calculateGenerationRate(
                GENERATION_RATE,
                mLastDeposit[_account],
                mLastMint[_account]
            );
        uint256 generationAmount = mStakeBalance[_account].wadToRay().rayMul(calculatedGenerationRate).rayToWad();

        // calculate split (90% to user, 5% to regeneration pool, 5% to ecofi)
        uint256 userShare = generationAmount.mul(90).div(100);
        uint256 fivePercent = generationAmount.div(20);

        return (userShare, fivePercent);
    }


    function generateTokensFromStake()
        internal
    {
        // calculate reward if existing balance
        if(mStakeBalance[msg.sender] > 0){
            uint256 userShare;
            uint256 fivePercent;
            (userShare, fivePercent) = calculateTokenGeneration(msg.sender);
            _mint(msg.sender, userShare);
            _mint(mEcoFi, fivePercent);
            _mint(address(this), fivePercent);
            mReservePool[msg.sender] = mReservePool[msg.sender].add(fivePercent);
            mLastMint[msg.sender] = block.timestamp;
        }
    }
    /**
     * @notice Deposit ECO token for staking SPRT.
     * @param _amount Amount of tokens to stake (in wei units)
     * @dev User must first approve this contract for the required amount.
     */
    function stakeDeposit(uint256 _amount) public {

        // calculate reward if existing balance
        if(mStakeBalance[msg.sender] > 0){
            generateTokensFromStake();
        }
        IERC20(mEcoFiTokenContract).safeTransferFrom(msg.sender, address(this), _amount);
        mStakeBalance[msg.sender] = mStakeBalance[msg.sender].add(_amount);
        mLastDeposit[msg.sender] = block.timestamp;
        mLastMint[msg.sender] = block.timestamp;

    }

    /**
     * @notice Withdraw ECO token (stop staking for SPRT).
     * @param _amount Amount of tokens to withdraw (in wei units)
     * @dev Withdraws ECO tokens `amount` .
     */
    function stakeWithdraw(uint256 _amount) public {

        // Only allow withdraw if minimum time elapsed since last deposit
        require(MIN_STAKE_DURATION_SECONDS.add(mLastDeposit[msg.sender]) < block.timestamp, "MinStakeDuration not elapsed yet");
        // Only allow withdraw if there is sufficient balance
        require(mStakeBalance[msg.sender] >= _amount, "SproutToken: Withdraw amount exceeds balance");

        generateTokensFromStake();

        // mLastDeposit[msg.sender] = block.timestamp; // removing this line as it is not nessecary (i think)
        mStakeBalance[msg.sender] = mStakeBalance[msg.sender].sub(_amount);
        if(mStakeBalance[msg.sender] == 0){
            // release reserve balance
            _transfer(address(this), msg.sender, mReservePool[msg.sender]);
            mReservePool[msg.sender] = 0;
        }
        IERC20(mEcoFiTokenContract).safeTransfer(msg.sender, _amount);

    }

    function balanceOf(address _account) public view virtual override returns (uint256){

        uint256 userShare;
        uint256 fivePercent;

        if(mStakeBalance[_account] > 0){
            (userShare, fivePercent) = calculateTokenGeneration(_account);
        }
        return super.balanceOf(_account).add(userShare);
    }

    function reserveBalanceOf(address _account) public view returns (uint256){
        return mReservePool[_account];
    }

    function ecoBalanceOf(address _account) public view returns (uint256){
        return mStakeBalance[_account];
    }

    /**
     * @notice Returns the information required to extrapolate the generation amount.
     * @param _account Address of the account of which the information is needed.
     * @return rawBalance SPRT balance, not taking current stakes into account.
     * @return stakeBalance Staked ECO amount.
     * @return lastDeposit Last deposit timestamp in seconds since epoch.
     * @return lastMint Last mint timestamp in seconds since epoch.
     * @return blockTime Current block time.
     * @dev The returned SPRT balance is not taking the current stake into 
     * @dev account. This is required to know the actual amount of SPRT after 
     * @dev extrapolation since `balanceOf` accounts for the current stake.
     */
    function generationExtrapolationInformation(address _account)
    public
    view
    returns (
        uint256 rawBalance,
        uint256 stakeBalance,
        uint256 lastDeposit,
        uint256 lastMint,
        uint256 blockTime
    )
    {
        return (
            super.balanceOf(_account),
            mStakeBalance[_account],
            mLastDeposit[_account],
            mLastMint[_account],
            block.timestamp
        );
    }
}
