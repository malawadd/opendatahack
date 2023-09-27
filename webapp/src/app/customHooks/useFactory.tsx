import { message } from "antd";
import { BigNumber, ContractTransaction, ethers } from "ethers";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BondingMunhna } from "../../contracts/BondingMunhna";
import { factoryContract } from "../../contracts/factoryContract";
import {
  chainList,
  defaultChainId,
  defaultPublicRpc,
  defaultPublicRpcTestnet,
  errorMessages,
  factoryContractAddress,
  factoryContractAddressTestnet,
  responseMessages,
} from "../../utils/constants";
import { TokenPairStruct } from "../../utils/types";
import {
  selectFactoryLoaded,
  selectFactoryLoading,
  selectFactoryTokenList,
} from "../slice/factory/factory.selector";
import {
  resetFactory,
  setLoadingList,
  setTokenList,
} from "../slice/factory/factory.slice";
import { selectNetwork } from "../slice/wallet.selector";
import { BuyTokens, DeployParams, SellTokens } from "./constants";
import useErc20 from "./useErc20";
import useMetamaskProvider from "./useMetamaskProvider";

function useFactory() {
  const { metaState } = useMetamaskProvider();
  const factoryLoaded = useSelector(selectFactoryLoaded);
  const factoryLoading = useSelector(selectFactoryLoading);
  const deployedTokenList = useSelector(selectFactoryTokenList);
  const chainId = useSelector(selectNetwork);
  const dispatch = useDispatch();
  const { getContractInstance: getErc20 } = useErc20();

  const getContractInstance = useCallback(
    async (contractAddress: string, readOnly?: boolean) => {
      if (readOnly && !metaState.web3) {
        const network = chainId || defaultChainId;
        const rpc =
          network === chainList.mainnet
            ? defaultPublicRpc
            : defaultPublicRpcTestnet;
        const provider = new ethers.providers.JsonRpcProvider(rpc);
        return new ethers.Contract(
          contractAddress,
          factoryContract.abi,
          provider
        );
      }

      try {
        return new ethers.Contract(
          contractAddress,
          factoryContract.abi,
          metaState.web3.getSigner()
        );
      } catch (e: any) {
        message.error(errorMessages.walletConnectionRequired);
      }
    },
    [chainId, metaState.web3]
  );

  const getBondingCurveInstance = useCallback(
    async (contractAddress: string, readOnly?: boolean) => {
      if (readOnly && !metaState.web3) {
        const network = chainId || defaultChainId;
        const rpc =
          network === chainList.mainnet
            ? defaultPublicRpc
            : defaultPublicRpcTestnet;
        const provider = new ethers.providers.JsonRpcProvider(rpc);
        return new ethers.Contract(contractAddress, BondingMunhna.abi, provider);
      }

      try {
        return new ethers.Contract(
          contractAddress,
          BondingMunhna.abi,
          metaState.web3.getSigner()
        );
      } catch {
        message.error(errorMessages.walletConnectionRequired);
      }
    },
    [chainId, metaState.web3]
  );

  const deployBondingToken = async ({
    name,
    symbol,
    cap,
    lockPeriod,
    precision,
    curveType,
    pairToken,
    logoURL,
    salt,
  }: DeployParams) => {
    const network = chainId || defaultChainId;
    const factoryAdd =
      network === chainList.mainnet
        ? factoryContractAddress
        : factoryContractAddressTestnet;
    if (factoryAdd) {
      const contract = await getContractInstance(factoryAdd);

      if (contract) {
        const deployTxnResponse: ContractTransaction =
          await contract.deployMunhna(
            name,
            symbol,
            logoURL,
            cap,
            lockPeriod,
            precision,
            curveType,
            pairToken,
            salt
          );
        await deployTxnResponse.wait();

        return deployTxnResponse;
      }

      return "";
    }
  };

  const getTokenPairList = useCallback(async () => {
    const network = chainId || defaultChainId;
    const factoryAdd =
      network === chainList.mainnet
        ? factoryContractAddress
        : factoryContractAddressTestnet;
    if (factoryAdd) {
      const contract = await getContractInstance(factoryAdd, true);
      if (!contract) return [];
      const tokenPairs: TokenPairStruct[] = await contract.getTokenPairList();
      return tokenPairs ?? [];
    }
    return [];
  }, [chainId, getContractInstance]);

  const updateFactorySlice = useCallback(async () => {
    const tokenPair = await getTokenPairList();

    dispatch(setTokenList(tokenPair));
  }, [dispatch, getTokenPairList]);

  useEffect(() => {
    if (!factoryLoaded && !factoryLoading) {
      dispatch(setLoadingList());
      updateFactorySlice();
    }
  }, [dispatch, factoryLoaded, chainId, factoryLoading, updateFactorySlice]);

  useEffect(() => {
    return () => {
      dispatch(resetFactory());
    };
  }, [chainId, dispatch]);

  const buyTokens = async ({
    tokenManager,
    amount,
    estimatedPrice,
    tokenB,
  }: BuyTokens) => {
    try {
      const contract = await getBondingCurveInstance(tokenManager);
      const erc20 = await getErc20(tokenB);

      if (contract && erc20 && estimatedPrice && amount) {
        const allowance = await erc20.allowance(
          await contract.signer.getAddress(),
          tokenManager
        );

        if (allowance < estimatedPrice) {
          const approve = await erc20.approve(tokenManager, estimatedPrice);
          await approve.wait();
        }

        const buyTx: ContractTransaction = await contract.buy(amount, {
          gasLimit: 3000000,
        });
        await buyTx.wait();

        return buyTx.hash;
      }
      return "";
    } catch (e: any) {
      const code = e?.code;
      if (code === 4001 || code === "ACTION_REJECTED") {
        message.error(responseMessages.txnRejected);
      } else {
        message.error(responseMessages.txnUnsuccessful);
      }
    }
  };

  const sellTokens = async ({ tokenManager, amount, tokenA }: SellTokens) => {
    try {
      const contract = await getBondingCurveInstance(tokenManager);
      const erc20 = await getErc20(tokenA);

      if (contract && erc20) {
        const wallet = await contract.signer.getAddress();
        const balance: BigNumber = await erc20.balanceOf(wallet);
        const unlockableBalance: BigNumber = await erc20.unlockableBalanceOf(
          wallet
        );
        const lockedBalance: BigNumber = await erc20.lockedBalanceOf(wallet);

        if (balance.lt(amount)) {
          message.error(errorMessages.insufficientBalance);
          return "";
        } else if (balance.sub(lockedBalance).lt(amount)) {
          if (balance.sub(lockedBalance).add(unlockableBalance).lt(amount)) {
            message.error(errorMessages.vestingPeriodNotEnded);
            return "";
          }
          const unlock = await erc20.unlock();
          await unlock.wait();
        }

        const sellTx: ContractTransaction = await contract.sell(amount, {
          gasLimit: 3000000,
        });
        await sellTx.wait();

        return sellTx.hash;
      }

      return "";
    } catch (e: any) {
      const code = e?.code;
      if (code === 4001 || code === "ACTION_REJECTED") {
        message.error(responseMessages.txnRejected);
      } else {
        message.error(responseMessages.txnUnsuccessful);
      }
    }
  };

  return {
    deployedTokenList,
    metaState,
    getContractInstance,
    getBondingCurveInstance,
    getTokenPairList,
    deployBondingToken,
    buyTokens,
    sellTokens,
  };
}

export default useFactory;
