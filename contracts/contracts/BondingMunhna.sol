// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Interface/IMunhnaErc20.sol";
import "hardhat/console.sol";

/**
 * @title Munhna Bonding munhna formulas contract for the token vesting
 * @notice This contracts helps the Munhna token contract to perform
 * the buy and sell functionality using the bonding munhna mechanism.
 */
contract BondingMunhna is Context {
    error InvalidMunhnaType();
    error InvalidAmount();

    using SafeMath for uint256;

    uint256 public constant DECIMALS = 18;
    uint256 public immutable CURVE_PRECISION;

    address immutable tokenA;
    address immutable tokenB;
    uint256 public reserveBalance;
    uint256 public scalingFactor;
    uint8 public munhnaType;

    event Purchase(address indexed buyer, uint256 amount, uint256 cost);
    event Sale(address indexed seller, uint256 amount, uint256 refund);

    uint256 public totalSupply;

    constructor(
        uint256 precision,
        uint8 _munhnaType,
        address _tokenA,
        address _tokenB
    ) {
        munhnaType = _munhnaType;
        tokenA = _tokenA;
        tokenB = _tokenB;
        totalSupply = 0;
        CURVE_PRECISION = precision;
        scalingFactor = calculateScalingFactor();
    }

    function calculateScalingFactor() internal pure returns (uint256) {
        return (10 ** DECIMALS);
    }

    function calculatePurchaseReturn(
        uint256 _investment
    ) internal view returns (uint256) {
        if (munhnaType == 1) {
            // Linear Munhna - (mx1^2 / 2) - (mx2^2 / 2); x1 > x2
            // here m is 1/CURVE_PRECISION
            uint256 newTotal = totalSupply.add(_investment);

            return
                newTotal
                    .mul(newTotal)
                    .mul(scalingFactor)
                    .div(2)
                    .div(scalingFactor)
                    .div(scalingFactor)
                    .div(CURVE_PRECISION)
                    .sub(reserveBalance);
        } else if (munhnaType == 4) {
            // Polynomial Munhna - (mx1^2 / 2) - (mx2^2 / 2); x1 > x2
            // here m is 1/CURVE_PRECISION
            uint256 newTotal = totalSupply.add(_investment);
            return
                (newTotal ** 3)
                    .div(3)
                    .div(scalingFactor)
                    .div(scalingFactor)
                    .sub(reserveBalance)
                    .div(CURVE_PRECISION);
        } else {
            revert InvalidMunhnaType();
        }
    }

    function calculateSaleReturn(
        uint256 _amount
    ) internal view returns (uint256) {
        if (munhnaType == 1) {
            // Linear Munhna - (mx1^2 / 2) - (mx2^2 / 2); x1 > x2
            // here m is CURVE_PRECISION
            uint256 newTotal = totalSupply.sub(_amount);
            return
                reserveBalance.sub(
                    newTotal.mul(newTotal).div(2).div(scalingFactor).mul(
                        CURVE_PRECISION
                    )
                );
        } else if (munhnaType == 4) {
            // Polynomial Munhna - (mx1^2 / 2) - (mx2^2 / 2); x1 > x2
            // here m is CURVE_PRECISION
            uint256 newTotal = totalSupply.sub(_amount);
            return
                reserveBalance.sub(
                    (newTotal ** 3)
                        .div(3)
                        .div(scalingFactor)
                        .div(scalingFactor)
                        .div(CURVE_PRECISION)
                );
        } else {
            revert InvalidMunhnaType();
        }
    }

    function _buy(uint256 amount) internal returns (uint256 priceForToken) {
        priceForToken = calculatePurchaseReturn(amount);

        IMunhnaErc20(tokenA).mintAndLock(_msgSender(), amount);
        totalSupply += amount;

        emit Purchase(msg.sender, amount, priceForToken);
    }

    function buy(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();

        uint256 priceOfPurchase = _buy(amount);

        IERC20(tokenB).transferFrom(
            _msgSender(),
            address(this),
            priceOfPurchase
        );

        reserveBalance = reserveBalance.add(priceOfPurchase);
    }

    function _sell(uint256 _amount) internal returns (uint256 refund) {
        refund = calculateSaleReturn(_amount);

        IMunhnaErc20(tokenA).burn(_msgSender(), _amount);
        totalSupply -= _amount;

        emit Sale(msg.sender, _amount, refund);
    }

    function sell(uint256 _amount) external {
        if (_amount == 0) revert InvalidAmount();

        uint256 refund = _sell(_amount);

        IERC20(tokenB).transfer(_msgSender(), refund);

        reserveBalance = reserveBalance.sub(refund);
    }
}
