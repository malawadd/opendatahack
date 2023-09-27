export const errorMessages = {
  connectWalletFailed: "Failed To Connect",
  unSupportedNetwork:
    "Unsupported Network, Kindly Connect To Supported Network",
  walletConnectionRequired: "Please connect wallet",
  insufficientBalance: "Insufficient balance to make transaction",
  vestingPeriodNotEnded: "Vesting Period Not Ended, Please Try Less Amount",
  transferTransfer: "Transaction failed with unknown error",

  precisionZero: "Precision should be greater than 0",
  precisionRequired: "Please input Precision!",

  exceedsBalance: "Withdrawal amount exceeds the balance",
};

export const NftStorageToken = process.env.REACT_APP_NFT_STORAGE_API_TOKEN;

export const factoryContractAddress = process.env.REACT_APP_FACTORY_CONTRACT;

export const factoryContractAddressTestnet =
  process.env.REACT_APP_FACTORY_CONTRACT_TESTNET;

export const defaultPublicRpc =
  process.env.REACT_APP_DEFAULT_PUBLIC_RPC_MAINNET;

export const defaultPublicRpcTestnet =
  process.env.REACT_APP_DEFAULT_PUBLIC_RPC_TESTNET;

export const pairTokenAddress =
  process.env.REACT_APP_PAIR_TOKEN_MAINNET_ADDRESS ?? "";

export const pairTokenAddressTestnet =
  process.env.REACT_APP_PAIR_TOKEN_TESTNET_ADDRESS ?? "";

export const defaultChainId = process.env.REACT_APP_DEFAULT_CHAIN_ID;

export const UsdtLogoUrl = process.env.REACT_APP_PAIR_TOKEN_LOGO_URL ?? "";

export const supportedChains = ["314159"];

export const chainList = {
  mainnet: "314",
  testnet: "314159",
};

export const explorerList = {
  mainnetUrl: "https://fvm.starboard.ventures/calibration/explorer/tx/",
  testnetUrl: "https://fvm.starboard.ventures/calibration/explorer/tx/",
};

export const sections = {
  buy: "Buy",
  withdraw: "Withdraw",
};

export const responseMessages = {
  txnSuccess: "Transaction Success",
  txnFailed: "Transaction Failed",
  txnRejected: "Transaction Rejected",
  txnUnsuccessful: "Transaction Unsuccessful, Try Again",
};

export const messages = {
  buyGraph:
    "The Graph will be changed with respect to the selected token for purchase.",
  withdrawGraph:
    "The Graph will be changed with respect to the selected token for withdrawal.",
};

export const priceCardItems = {
  tokenA: "tokenA",
  tokenB: "tokenB",
  tokenAAmount: "tokenAAmount",
  tokenBAmount: "tokenBAmount",
  bondingCurveContract: "bondingCurveContract",
};

export const tokenInputPlaceholders = "Select Token";

export const googleFormsLink = "";

export const socialLinks = {
  twitter: "",
  discard: "",
  linkedIn: "",
};
