// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/utils/Context.sol";

import "./BondingMunhna.sol";
import "./MunhnaERC20.sol";

/**
 * @title Munhna factory
 * @dev A factory contract for deploying the tokens
 */
contract MunhnaFactory is Context {
    /// emits then a token is created
    /// @param token token address
    /// @param manager address of the token manager
    event TokenCreated(address token, address manager);

    /**
     * @dev contains the details of a token pair and token manager details
     */
    struct TokenPair {
        address tokenA;
        address tokenB;
        address tokenManager;
        address owner;
        string logoUri;
        uint8 curveType;
        uint256 lockPeriod;
        uint256 cap;
        uint256 precision;
    }

    /**
     * @dev contains the token details and user balance
     */
    struct TokenDetails {
        address tokenAddress;
        string tokenName;
        string tokenSymbol;
        uint256 balance;
        uint256 unlockableBalance;
        uint256 lockedBalance;
    }

    TokenPair[] tokenPairs;

    TokenDetails[] balances;

    /**
     * @dev returns the list of TokenPairs
     */
    function getTokenPairList() external view returns (TokenPair[] memory) {
        return tokenPairs;
    }

    /**
     * @dev creates a new token with a management contract
     *
     * @param name token name
     * @param symbol token symbol
     * @param logoUri token logo uri
     * @param cap token maximum supply
     * @param lockPeriod token period in seconds
     * @param precision token precision to calculate the price
     * @param _curveType type of bonding curve
     * @param pairToken token address to use for buy and sell
     * @param salt random salt for token deployment
     */
    function deployMunhna(
        string memory name,
        string memory symbol,
        string memory logoUri,
        uint256 cap,
        uint256 lockPeriod,
        uint256 precision,
        uint8 _curveType,
        address pairToken,
        uint256 salt
    ) public {
        // Deploy token contract
        bytes memory tokenCreationCode = type(Munhna_ERC20).creationCode;

        bytes memory tokenBytecode = abi.encodePacked(
            tokenCreationCode,
            abi.encode(name, symbol, cap, lockPeriod)
        );

        address token;
        assembly {
            token := create2(
                0,
                add(tokenBytecode, 0x20),
                mload(tokenBytecode),
                salt
            )

            if iszero(extcodesize(token)) {
                revert(0, 0)
            }
        }

        // Deploy bonding curve contract
        bytes memory managerCreationCode = type(BondingMunhna).creationCode;

        bytes memory managerBytecode = abi.encodePacked(
            managerCreationCode,
            abi.encode(precision, _curveType, token, pairToken)
        );

        address tokenManager;
        assembly {
            tokenManager := create2(
                0,
                add(managerBytecode, 0x20),
                mload(managerBytecode),
                salt
            )

            if iszero(extcodesize(tokenManager)) {
                revert(0, 0)
            }
        }

        // grant minter role for token manager contract
        Munhna_ERC20(token).grantRole(
            Munhna_ERC20(token).TOKEN_MANAGER_ROLE(),
            tokenManager
        );

        tokenPairs.push(
            TokenPair(
                token,
                pairToken,
                tokenManager,
                _msgSender(),
                logoUri,
                _curveType,
                lockPeriod,
                cap,
                precision
            )
        );

        emit TokenCreated(address(token), address(tokenManager));
    }

    /**
     * @dev returns the erc20 token details
     *
     * @param tokenAddress erc20 contract address
     * @param walletAddress account address
     * @return name
     * @return symbol
     * @return balance
     * @return unlockableBalance
     * @return lockedBalance
     */
    function tokenDetails(
        address tokenAddress,
        address walletAddress
    )
        internal
        view
        returns (
            string memory name,
            string memory symbol,
            uint256 balance,
            uint256 unlockableBalance,
            uint256 lockedBalance
        )
    {
        name = Munhna_ERC20(tokenAddress).name();
        symbol = Munhna_ERC20(tokenAddress).symbol();

        balance = Munhna_ERC20(tokenAddress).balanceOf(walletAddress);
        unlockableBalance = Munhna_ERC20(tokenAddress).unlockableBalanceOf(
            walletAddress
        );
        lockedBalance = Munhna_ERC20(tokenAddress).lockedBalanceOf(
            walletAddress
        );
    }

    /**
     * @dev returns the list token balances of the given wallet address
     * from all the given address
     *
     * Note - don't make transaction, use static calls
     * @param walletAddress account address
     */
    function getAllBalanceOf(
        address walletAddress
    ) external returns (TokenDetails[] memory) {
        for (uint i = 0; i < tokenPairs.length; i++) {
            (
                string memory name,
                string memory symbol,
                uint256 balance,
                uint256 unlockableBalance,
                uint256 lockedBalance
            ) = tokenDetails(tokenPairs[i].tokenA, walletAddress);

            if (balance > 0) {
                TokenDetails memory details = TokenDetails(
                    tokenPairs[i].tokenA,
                    name,
                    symbol,
                    balance,
                    unlockableBalance,
                    lockedBalance
                );
                balances.push(details);
            }
        }

        return balances;
    }
}
