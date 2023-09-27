import { message } from "antd";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMetamask } from "use-metamask";
import { errorMessages, supportedChains } from "../../utils/constants";
import { selectNetwork } from "../slice/wallet.selector";
import { resetWallet, setNetwork, setWallet } from "../slice/wallet.slice";

function useMetamaskProvider() {
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState("");
  const network = useSelector(selectNetwork);

  const { connect, metaState, getChain } = useMetamask();
  const dispatch = useDispatch();

  //For Future Reference
  const getBalance = useCallback(
    async (address: string) => {
      if (address && metaState.isConnected && metaState.web3) {
        const response = await metaState.web3.getBalance(address);
        const balanceEth = ethers.utils.formatEther(response);
        setBalance(balanceEth);
      }
    },
    [metaState.isConnected, metaState.web3]
  );

  const getCurrentNetwork = useCallback(async (): Promise<string> => {
    if (getChain) {
      const chain = await getChain();
      return chain.id;
    }
    return "";
  }, [getChain]);

  const detectNetworkChange = useCallback(() => {
    window.ethereum?.on("chainChanged", async () => {
      const chainId = await getCurrentNetwork();
      if (chainId && chainId === network) return;

      if (!supportedChains.includes(chainId)) {
        message.error(errorMessages.unSupportedNetwork);
        dispatch(resetWallet());
      } else {
        dispatch(setNetwork(chainId));
      }
    });
    return () =>
      window.ethereum?.removeListener("chainChanged", () => {
        window.location.reload();
      });
  }, [dispatch, getCurrentNetwork, network]);

  const connectWallet = async () => {
    if (metaState.isAvailable) {
      try {
        const chainId = await getCurrentNetwork();
        if (!supportedChains.includes(chainId)) {
          message.error(errorMessages.unSupportedNetwork);
          dispatch(resetWallet());
          setConnected(false);
          return;
        } else {
          dispatch(setNetwork(chainId));
          dispatch(setWallet(metaState.account[0]));
        }

        if (!metaState.isConnected) {
          await connect?.(ethers.providers.Web3Provider, "any");
          setConnected(true);
        }
      } catch (error) {
        message.error(errorMessages.connectWalletFailed);
      }
    } else {
      window.open("https://metamask.io/download/", "blank");
    }
  };

  useEffect(() => {
    if (metaState.isConnected) {
      dispatch(setWallet(metaState.account[0]));
      getBalance(metaState.account[0]);
    }
  }, [getBalance, metaState.account, metaState.isConnected, dispatch]);

  return { connected, metaState, balance, connectWallet, detectNetworkChange };
}

export default useMetamaskProvider;
