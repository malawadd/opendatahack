import { BigNumberish } from "ethers";

export type DeployParams = {
  name: string;
  symbol: string;
  cap: BigNumberish;
  lockPeriod: BigNumberish;
  precision: BigNumberish;
  curveType: BigNumberish;
  pairToken: string;
  logoURL: string;
  salt: string;
};

export type BuyTokens = {
  tokenA: string;
  tokenB: string;
  tokenManager: string;
  amount: BigNumberish;
  estimatedPrice: BigNumberish;
};

export type SellTokens = {
  tokenA: string;
  tokenB: string;
  tokenManager: string;
  amount: BigNumberish;
  estimatedPrice: BigNumberish;
};
