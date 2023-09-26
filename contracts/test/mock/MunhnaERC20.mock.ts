import { ethers } from "hardhat";

export default {
  tokenName: "MUN",
  tokenSymbol: "MUN",
  logoUri: "https://www.MUN.io",
  cap: ethers.utils.parseEther("10000000000000"),
  lockPeriod: 30 * 24 * 60 * 60,
  precision: 1000,
  curveType: 1,
  usdt: "usdt",
  salt: "0x5350fb9979070d67e882b3bc489c8e9c5960195c59a9257c38113dd19ba7a119",
};
