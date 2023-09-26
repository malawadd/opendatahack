// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title Munhnae Interface
 * @dev This interface contains method for calculating the purchase/sell price.
 */
interface IMunhnaErc20 {
    /// @notice Thrown when token name is too short or too long
    error TokenNameLengthOutOfRange(uint8 min, uint8 max);

    /// @notice Thrown when token symbol is too short or too long
    error TokenSymbolLengthOutOfRange(uint8 min, uint8 max);

    /// @notice Supply cap amount is out of range
    error SupplyCapOutOfRange(uint256 min, uint256 max);

    /// @notice While minting total supply exceeds supply cap
    error MintExceedsSupplyCap(uint256 amount, uint256 maximumMintable);

    /// @notice When transfer amount exceeds available transferable amount
    error InsufficientUnlockedTokens(
        uint256 unlockedBalance,
        uint256 minRequired
    );

    /// @notice Lock amount exceeds the transferable amount
    error LockAmountExceedsBalance(uint256 required, uint256 balance);

    /// @notice unlock called when unlockable balance is zero
    error UnlockableBalanceZero();

    /// @notice locking period is zero
    error LockingPeriodZero();

    /// @notice locking period is zero
    error TokenManagerZero();

    /**
     * @dev stores the amount and unlock timestamp required to unlock the token
     *
     * Params:
     *
     * - `amount` - amount of tokens to lock
     * - `unlockTimestamp` - lock period ending time(unix timestamp)
     */
    struct Lock {
        uint256 amount;
        uint256 unlockTimestamp;
    }

    /**
     * @dev emits when tokens are locked for a account
     *
     * @param account account address
     * @param amount amount of token to lock
     */
    event TokenLocked(address account, uint256 amount);

    /**
     * @dev emits when tokens are unlocked for a account
     *
     * @param account account address
     * @param amount amount of token to lock
     */
    event TokenUnlocked(address account, uint256 amount);

    /**
     * @dev Returns the amount of tokens locked in the given account address
     */
    function lockedBalanceOf(address account) external view returns (uint256);

    /**
     * @dev returns the amount of tokens that can be unlocked by the account
     */
    function unlockableBalanceOf(
        address account
    ) external view returns (uint256);

    /**
     * @dev unlocks all the token available for unlocking
     *
     * Requirement:
     *
     * - used must have tokens that are ready to unlock
     *
     * Emits a {TokenUnlocked} event on successful token lock
     */
    function unlock() external;

    /**
     * @dev This function lets the minter mint the tokens
     * and locks the minted token
     *
     * @param account account address that receives minted tokens
     * @param amount amount tokens to mint and lock
     */
    function mintAndLock(address account, uint256 amount) external;

    /**
     * @dev This function lets the minter burn the token
     *
     * @param account account address that burns tokens
     * @param amount amount tokens to burn
     */
    function burn(address account, uint256 amount) external;
}
