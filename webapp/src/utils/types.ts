import { BigNumber } from "ethers";

export type TokenPairStruct = {
  tokenA: string;
  tokenB: string;
  tokenManager: string;
  owner: string;
  logoUri: string;
  curveType: number;
  lockPeriod: BigNumber;
  cap: BigNumber;
  precision: BigNumber;
};

export type AllBalanceType = {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  balance: BigNumber;
  unlockableBalance: BigNumber;
  lockedBalance: BigNumber;
  curveType: BigNumber;
  precision: BigNumber;
  totalSupply: BigNumber;
};
