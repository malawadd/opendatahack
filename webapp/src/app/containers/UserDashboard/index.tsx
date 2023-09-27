import { Spin } from "antd";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  getBalanceList,
  getPortfolioBalance,
  getTokenName,
  parseDeployedTokenList,
} from "../../components/PriceCard/service";
import TableComponent from "../../components/Table/Table";
import {
  claimableColumns,
  deployedColumns,
} from "../../components/Table/constants";

import useErc20 from "../../customHooks/useErc20";
import useFactory from "../../customHooks/useFactory";

import {
  Banner,
  UsdBalance,
  WalletIconDashboard,
} from "../../../assets/images/imageAssets";

import {
  selectFactoryLoaded,
  selectFactoryLoading,
} from "../../slice/factory/factory.selector";
import { resetFactory } from "../../slice/factory/factory.slice";
import {
  selectNetwork,
  selectWallet,
  selectWalletConnected,
} from "../../slice/wallet.selector";
import { DeployedTokensList } from "./types";

import {
  chainList,
  defaultChainId,
  factoryContractAddress,
  factoryContractAddressTestnet,
} from "../../../utils/constants";
import { AllBalanceType } from "../../../utils/types";
import "./index.scss";

const UserDashBoard = () => {
  const [tokenDetails, setTokenDetails] = useState<DeployedTokensList[]>([]);
  const [claimable, setClaimable] = useState<AllBalanceType[]>([]);
  const [portFolioBal, setPortFolioBal] = useState<string>("--");

  const dispatch = useDispatch();

  const walletAddress = useSelector(selectWallet);
  const walletConnected = useSelector(selectWalletConnected);
  const factoryLoading = useSelector(selectFactoryLoading);
  const factoryLoaded = useSelector(selectFactoryLoaded);
  const chainId = useSelector(selectNetwork);

  const { getContractInstance } = useErc20();
  const {
    deployedTokenList,
    getContractInstance: getFactory,
    getBondingCurveInstance,
  } = useFactory();

  const getPairs = useCallback(async () => {
    const contract = await getContractInstance(ethers.constants.AddressZero);
    if (contract) {
      const parsedData = deployedTokenList
        .filter((e) => e.owner.toLowerCase() === walletAddress?.toLowerCase())
        .map(parseDeployedTokenList);
      let filteredDetails: DeployedTokensList[] = [];
      if (parsedData.length) {
        const getErc20Name = getTokenName(contract);
        filteredDetails = await getErc20Name(parsedData);
      }

      const network = chainId || defaultChainId;
      const factoryAdd =
        network === chainList.mainnet
          ? factoryContractAddress
          : factoryContractAddressTestnet;

      if (factoryAdd) {
        const factory = await getFactory(factoryAdd, true);
        const bcc = await getBondingCurveInstance(ethers.constants.AddressZero);
        if (factory && bcc) {
          const balanceList = await getBalanceList(
            factory,
            bcc,
            deployedTokenList
          );
          const { claimable, portfolioBalance } =
            getPortfolioBalance(balanceList);

          setClaimable(claimable);

          setPortFolioBal(
            Number(
              ethers.utils.formatEther(portfolioBalance.toString())
            ).toString()
          );
        }
      }

      setTokenDetails(filteredDetails);
    }
  }, [
    chainId,
    deployedTokenList,
    getBondingCurveInstance,
    getContractInstance,
    getFactory,
    walletAddress,
  ]);

  useEffect(() => {
    if (walletConnected && factoryLoaded) getPairs();
  }, [factoryLoaded, getPairs, walletConnected]);

  useEffect(() => {
    dispatch(resetFactory());
  }, [dispatch]);

  if (factoryLoading && walletConnected) {
    return (
      <div className="dashboard-loading">
        <Spin tip="Loading" size="large">
          <div className="content" />
        </Spin>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="banner-section">
        <img className="banner" src={Banner} alt="banner" />
        <div className="details">
          <div className="wallet">
            <img
              className="wallet-icon"
              src={WalletIconDashboard}
              alt="WalletIcon"
            />
            <div>
              <p className="address">WALLET ADDRESS</p>
              <p className="value">
                {walletAddress ? walletAddress : "No Wallet Address Available!"}
              </p>
            </div>
          </div>
          <hr className="line" />
          <div className="balance">
            <div className="section">
              <img className="wallet-icon" src={UsdBalance} alt="UsdBalance" />
              <div>
                <p className="address">PORTFOLIO VALUE</p>
                <p className="value">{portFolioBal} USD</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="tables">
        <div className="row">
          <div className="col-8">
            <p className="title">Deployed Tokens</p>
            <TableComponent
              dataSource={tokenDetails}
              columns={deployedColumns}
              classname="deployed-token-table"
            />
          </div>
          <div className="col-4">
            <div>
              <p className="title">Claimable Tokens</p>
              <TableComponent
                dataSource={claimable}
                columns={claimableColumns}
                classname="claimable-token-table"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashBoard;
