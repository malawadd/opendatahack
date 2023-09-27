import { BigNumber, BigNumberish, ethers } from "ethers";
import { UsdtLogoUrl } from "../../../utils/constants";
import { formatEtherBalance } from "../../../utils/methods";
import { AllBalanceType, TokenPairStruct } from "../../../utils/types";
import { DeployedTokensList } from "../../containers/UserDashboard/types";
import { DropdownOptions } from "../Dropdown";
import { CurveTypes } from "../Graphs/constants";
import { curveOptions } from "../Launchpad/constants";

// TODO - refactor this file

export type TokenDetails = {
  name: string;
  symbol: string;
  decimals: BigNumberish;
  balance: BigNumberish;
  address: string;
  totalSupply: BigNumberish;
  curveType?: number;
  cap?: BigNumberish;
  precision?: BigNumber;
  manager?: string;
  vestingPeriod?: number;
};

export type TokenPairDropdown = {
  tokenListA: (DropdownOptions & TokenPairStruct)[];
  tokenListB: (DropdownOptions & TokenPairStruct)[];
};

export type AllTokenDetails = Map<string, TokenDetails>;

export type ParseDeployedTokenListResult = Omit<DeployedTokensList, "token"> & {
  tokenAddress: string;
};

export const getCurvXDetails = (
  contract: ethers.Contract,
  walletAddress?: string
) => {
  return async (
    tokenAddress: string,
    tokenPair: TokenPairStruct
  ): Promise<TokenDetails> => {
    const tokenContract = contract.attach(tokenAddress);
    const [name, symbol, decimals, balance, totalSupply]: [
      string,
      string,
      BigNumber,
      BigNumber,
      BigNumber
    ] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
      walletAddress ? tokenContract.balanceOf(walletAddress) : 0,
      tokenContract.totalSupply(),
    ]);
    return {
      name,
      address: tokenAddress,
      balance: formatEtherBalance(balance, decimals),
      decimals,
      symbol,
      totalSupply,
      cap: tokenPair.cap,
      precision: tokenPair.precision,
      curveType: tokenPair.curveType,
      manager: tokenPair.tokenManager,
      vestingPeriod: Number(tokenPair.lockPeriod.toNumber() / (3600 * 24)),
    };
  };
};

export const getErc20Details = (
  contract: ethers.Contract,
  walletAddress?: string
) => {
  return async (
    tokenAddress: string
  ): Promise<Omit<TokenDetails, "cap" | "munhnaType" | "precision">> => {
    const tokenContract = contract.attach(tokenAddress);
    const [name, symbol, decimals, balance, totalSupply]: [
      string,
      string,
      BigNumber,
      BigNumber,
      BigNumber
    ] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
      walletAddress ? tokenContract.balanceOf(walletAddress) : 0,
      tokenContract.totalSupply(),
    ]);
    return {
      name,
      address: tokenAddress,
      balance: formatEtherBalance(balance, decimals),
      decimals,
      symbol,
      totalSupply,
    };
  };
};

export const splitTokenPair = async (
  deployedTokenList: TokenPairStruct[],
  contract: ethers.Contract,
  walletAddress?: string
) => {
  const curvXDetailsOf = getCurvXDetails(contract, walletAddress);
  const tokenDetailsOf = getErc20Details(contract, walletAddress);
  const allTokenDetails = new Map<string, TokenDetails>();

  await Promise.all(
    deployedTokenList.map(async (pair) => {
      allTokenDetails.set(pair.tokenA, await curvXDetailsOf(pair.tokenA, pair));
      allTokenDetails.set(pair.tokenB, await tokenDetailsOf(pair.tokenB));
    })
  );
  return {
    tokens: deployedTokenList.reduce<TokenPairDropdown>(
      (prev: TokenPairDropdown, curr: TokenPairStruct) => {
        const tokenA = allTokenDetails.get(curr.tokenA);
        const result = {
          tokenListA: [
            ...prev.tokenListA,
            {
              value: curr.tokenA,
              label: tokenA?.symbol ?? curr.tokenA,
              icon: curr.logoUri,
              ...curr,
            },
          ],
          tokenListB: [] as TokenPairDropdown["tokenListB"],
        };

        const hasTokenB =
          prev.tokenListB.findIndex(({ value }) => value === curr.tokenB) !==
          -1;
        if (hasTokenB) {
          result.tokenListB = prev.tokenListB;
          return result;
        }
        const tokenB = allTokenDetails.get(curr.tokenB);
        return {
          ...result,
          tokenListB: [
            ...prev.tokenListB,
            {
              value: curr.tokenB,
              label: tokenB?.symbol ?? curr.tokenB,
              icon: UsdtLogoUrl,
              ...curr,
            },
          ],
        };
      },
      {
        tokenListA: [],
        tokenListB: [],
      }
    ),
    allTokenDetails,
  };
};

const getCurveType = (type: number): CurveTypes | string => {
  switch (type) {
    case 1:
      return CurveTypes.linear;
    case 2:
      return CurveTypes.subLinear;
    case 3:
      return CurveTypes.sCurve;
    case 4:
      return CurveTypes.polynomial;
    default:
      return "--";
  }
};

export const parseDeployedTokenList = (
  e: TokenPairStruct,
  index: number
): ParseDeployedTokenListResult => ({
  key: index + 1,
  tokenAddress: e.tokenA,
  totalSupply: formatEtherBalance(e.cap).toString(),
  curveType: getCurveType(e.curveType),
  vestingPeriod: e.lockPeriod.div(3600 * 24) + " days",
});

export const getTokenName = (contract: ethers.Contract) => {
  return (
    deployedTokenList: ParseDeployedTokenListResult[]
  ): Promise<DeployedTokensList[]> => {
    return Promise.all(
      deployedTokenList.map(async ({ tokenAddress, ...rest }) => {
        const tokenContract = contract.attach(tokenAddress);
        const token: string = await tokenContract.name();
        return { token, ...rest };
      })
    );
  };
};

export const getLaunchpadPriceEstimate = (
  precision: number,
  curveType: string
) => {
  if (Number(precision)) {
    if (curveType === curveOptions[0].value) {
      return ethers.utils.formatEther(
        BigNumber.from(10).pow(18).div(2).div(precision)
      );
    } else if (curveType === curveOptions[1].value) {
      return ethers.utils.formatEther(
        BigNumber.from(10).pow(18).div(3).div(precision)
      );
    }
  }
  return 0;
};

export const getEstimationByCurveType = (
  tokenDetails: Omit<
    TokenDetails,
    "name" | "symbol" | "decimals" | "address" | "balance"
  >,
  amount: BigNumber,
  isBuy: boolean
) => {
  if (!tokenDetails.curveType) return 0;
  const curveType = getCurveType(tokenDetails.curveType);
  const totalSupply = BigNumber.from(tokenDetails.totalSupply);
  const precision = BigNumber.from(tokenDetails.precision);

  if (
    !totalSupply ||
    !precision ||
    precision.isZero() ||
    (!isBuy && totalSupply.isZero())
  ) {
    return 0;
  }

  if (isBuy) {
    if (curveType === CurveTypes.linear) {
      return totalSupply
        .add(amount)
        .pow(2)
        .div(2)
        .div(BigNumber.from(10).pow(18))
        .div(precision)
        .sub(
          totalSupply
            .pow(2)
            .div(2)
            .div(BigNumber.from(10).pow(18))
            .div(precision)
        );
    } else if (curveType === CurveTypes.polynomial) {
      return totalSupply
        .add(amount)
        .pow(3)
        .div(3)
        .div(precision)
        .div(BigNumber.from(10).pow(18))
        .div(BigNumber.from(10).pow(18))
        .sub(
          totalSupply
            .pow(2)
            .div(precision)
            .div(BigNumber.from(10).pow(18))
            .div(BigNumber.from(10).pow(18))
            .div(2)
        );
    }
  } else {
    if (curveType === CurveTypes.linear) {
      return totalSupply
        .pow(2)
        .div(2)
        .div(BigNumber.from(10).pow(18))
        .div(precision)
        .sub(
          BigNumber.from(totalSupply.sub(amount))
            .pow(2)
            .div(2)
            .div(BigNumber.from(10).pow(18))
            .div(precision)
        );
    } else if (curveType === CurveTypes.polynomial) {
      return totalSupply
        .pow(3)
        .div(3)
        .div(BigNumber.from(10).pow(18))
        .div(BigNumber.from(10).pow(18))
        .div(precision)
        .sub(
          totalSupply
            .sub(amount)
            .pow(2)
            .div(precision)
            .div(BigNumber.from(10).pow(18))
            .div(BigNumber.from(10).pow(18))
            .div(2)
        );
    }
  }
};

export const getBalanceList = async (
  contract: ethers.Contract,
  bcContract: ethers.Contract,
  deployedTokenList: TokenPairStruct[]
) => {
  const wallet = await contract.signer.getAddress();
  const tokenMap = new Map();

  deployedTokenList.forEach((token) => {
    tokenMap.set(token.tokenA, token);
  });

  const balanceDetails: Omit<
    AllBalanceType,
    "totalSupply" | "precision" | "curveType"
  >[] = await contract.callStatic.getAllBalanceOf(wallet);

  const filteredBalanceList = balanceDetails.filter(
    (balances) => !balances.balance.isZero()
  );

  const allBalanceDetails: AllBalanceType[] = await Promise.all(
    filteredBalanceList.map(async (balObj) => {
      const manager = tokenMap.get(balObj.tokenAddress).tokenManager;
      const currContract = bcContract.attach(manager);
      const totalSupply: BigNumber = await currContract.totalSupply();
      const curveType: BigNumber = await currContract.munhnaType();
      const precision: BigNumber =
        await currContract.callStatic.CURVE_PRECISION();
      return { ...balObj, totalSupply, precision, curveType };
    })
  );
  return allBalanceDetails;
};

export const getPortfolioBalance = (balList: AllBalanceType[]) => {
  const claimable = balList.filter(
    (value) => !value.unlockableBalance.isZero()
  );
  const portfolioBalance: BigNumber = balList.reduce((prev, curr) => {
    if (!curr.balance.isZero()) {
      const estimation = getEstimationByCurveType(
        {
          totalSupply: curr.totalSupply,
          curveType: BigNumber.from(curr.curveType).toNumber(),
          precision: curr.precision,
        },
        curr.balance,
        false
      );
      return estimation ? prev.add(estimation) : prev;
    }
    return prev;
  }, BigNumber.from(0));

  return { claimable, portfolioBalance };
};
