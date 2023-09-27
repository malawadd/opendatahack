import { message } from "antd";
import { ethers } from "ethers";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { MunhnaErc20 } from "../../contracts/MunhnaErc20";
import {
  chainList,
  defaultChainId,
  defaultPublicRpc,
  defaultPublicRpcTestnet,
  errorMessages,
} from "../../utils/constants";
import { selectNetwork } from "../slice/wallet.selector";
import useMetamaskProvider from "./useMetamaskProvider";

function useErc20() {
  const { metaState } = useMetamaskProvider();
  const chainId = useSelector(selectNetwork);

  const getContractInstance = useCallback(
    async (contractAddress: string, readOnly?: boolean) => {
      if (readOnly && !metaState.web3) {
        const network = chainId || defaultChainId;
        const rpc =
          network === chainList.mainnet
            ? defaultPublicRpc
            : defaultPublicRpcTestnet;
        const provider = new ethers.providers.JsonRpcProvider(rpc);
        return new ethers.Contract(contractAddress, MunhnaErc20.abi, provider);
      }
      try {
        return new ethers.Contract(
          contractAddress,
          MunhnaErc20.abi,
          await metaState.web3.getSigner()
        );
      } catch (e: any) {
        message.error(errorMessages.walletConnectionRequired);
      }
    },
    [chainId, metaState.web3]
  );

  return {
    metaState,
    getContractInstance,
  };
}

export default useErc20;
