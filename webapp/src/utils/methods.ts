import { BigNumber, BigNumberish, ethers } from "ethers";

export const formatWalletAddress = (
  walletAddress: string | null | undefined
) => {
  if (walletAddress) {
    return `${walletAddress?.slice(0, 6)}...${walletAddress.slice(-4)}`;
  }

  return "";
};

export const formatBalance = (balance?: string) => {
  if (!balance) return "--";
  return Number(
    ethers.utils.formatEther(
      ethers.utils.parseEther(Number(balance).toFixed(4))
    )
  );
};

export const formatEtherBalance = (
  balance: BigNumberish,
  units?: BigNumberish
) => {
  return Number(ethers.utils.formatUnits(BigNumber.from(balance), units));
};
