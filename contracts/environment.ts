import "dotenv/config";

const walletPrivateAddress: string = process.env.WALLET_PRIVATE_KEY ?? "";
const coinmarketcapKey: string = process.env.CMC_API_KEY ?? "";
const etherscanKey: string = process.env.ETHERSCAN_API_KEY ?? "";

if (!walletPrivateAddress) {
  throw new Error("Wallet private key is empty");
}

export const environment = {
  walletPrivateAddress,
  coinmarketcapKey,
  etherscanKey,
};
