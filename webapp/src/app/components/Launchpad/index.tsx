import { Button, Form, Input, Select, message } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  chainList,
  defaultChainId,
  errorMessages,
  pairTokenAddress,
  pairTokenAddressTestnet,
  responseMessages,
} from "../../../utils/constants";
import useFactory from "../../customHooks/useFactory";
import { resetFactory } from "../../slice/factory/factory.slice";
import {
  selectNetwork,
  selectWalletConnected,
} from "../../slice/wallet.selector";

import Graph from "../Graphs/Graph";
import ImageUploader from "../ImageUploader";
import { getLaunchpadPriceEstimate } from "../PriceCard/service";

import TransactionModal from "../TransactionModal/TransactionModal";
import {
  LaunchFormData,
  LaunchPadInitialValues,
  curveData,
  curveOptions,
  vestingPeriodOptions,
} from "./constants";
import { selectTokenError, selectTokenSuccess } from "./deploy.selector";
import {
  deployToken,
  resetTransactionState,
  setDeployTokenError,
} from "./deploy.slice";
import { ethers } from "ethers";

import "./index.scss";

const LaunchPad = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosable, setIsClosable] = useState(false);
  const [hash, setHash] = useState("");

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const walletConnected = useSelector(selectWalletConnected);

  const { deployBondingToken } = useFactory();
  const factory = useFactory();

  const [curve, setCurve] = useState<string>("1");

  const successMessage = useSelector(selectTokenSuccess);
  const errorMessage = useSelector(selectTokenError);
  const networkId = useSelector(selectNetwork);

  useEffect(() => {
    if (successMessage.message === responseMessages.txnSuccess) {
      message.success(successMessage.message);
      setHash(successMessage.hash);
      setIsClosable(true);
      dispatch(resetTransactionState());
    }
    if (
      errorMessage === responseMessages.txnFailed ||
      errorMessage === responseMessages.txnRejected
    ) {
      message.error(errorMessage);
      setIsModalOpen(false);
      dispatch(setDeployTokenError(""));
    }
  }, [successMessage, errorMessage, dispatch]);

  const handleChange = (value: string) => {
    setCurve(value);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setHash("");
    setIsClosable(false);
  };

  const getVestingPeriod = (value: string) => {
    return Number(value) * 24 * 60 * 60;
  };

  const precision = Form.useWatch("precision", form);

  const onFormSubmit = async (values: any) => {
    if (!walletConnected) {
      message.error(errorMessages.walletConnectionRequired);
      return;
    }

    const network = networkId || defaultChainId;

    const pair =
      network === chainList.mainnet
        ? pairTokenAddress
        : pairTokenAddressTestnet;

    showModal();
    const deploymentParams = {
      name: values.tokenName,
      symbol: values.tokenSymbol,
      cap: ethers.utils.parseEther(values.totalSupply.toString()),
      lockPeriod: values.vestingPeriod,
      precision: values.precision,
      curveType: Number(values.curveType),
      pairToken: pair,
      logoURL: values.fileIpfsUrl,
      salt: ethers.utils.solidityKeccak256(
        ['uint256'],
        [Math.floor(Math.random() * 1000000000)]
      ),
    };

    const transactionResponse = await factory.deployBondingToken(
      deploymentParams
    );


    const launchParams: LaunchFormData = {
      tokenName: values.tokenName,
      tokenSymbol: values.tokenSymbol,
      pairToken: pair,
      curveType: Number(values.curveType),
      logoImage: values.logoImage,
      curveParams: {
        totalSupply: Number(values.totalSupply),
        precision: Number(values.precision),
        lockPeriod: getVestingPeriod(values.vestingPeriod),
      },
    };
    console.log(launchParams)

    dispatch(

      deployToken({ formData: launchParams, deployToken: deployBondingToken })
    );
    dispatch(resetFactory());
  };


 

  return (
    <div className="launchpad-section">
      <div className="launchpad-box">
        <div className="description-box mint-tokens">
          <p className="description-title">Mint Tokens</p>
          <p className="description-content">
            Minting enables the creation of new tokens to meet demand or fulfil
            specific requirements. It allows for the expansion of token supply
            as needed, ensuring liquidity and availability in the market.
          </p>
        </div>
        <div className="launchpad-contents">
          <div className="details-title">Token Details</div>
          <Form
            form={form}
            initialValues={LaunchPadInitialValues}
            onFinish={onFormSubmit}
            layout="vertical"
          >
            <Form.Item
              label="Token Name"
              name="tokenName"
              rules={[{ required: true, message: "Please input Token Name!" }]}
            >
              <Input
                className="input-box"
                name="tokenName"
                placeholder="Eg., NAV Coin"
              />
            </Form.Item>
            <p className="input-description">
              This name will also be used a a contract name
            </p>
            <Form.Item
              label="Token Symbol"
              name="tokenSymbol"
              rules={[
                { required: true, message: "Please input Token Symbol!" },
                {
                  min: 3,
                  max: 5,
                  message: "Symbol must be 3-5 characters long",
                },
              ]}
            >
              <Input
                className="input-box"
                name="tokenName"
                placeholder="Eg., NAV"
              />
            </Form.Item>
            <p className="input-description">
              Choose a symbol for your token ( usually 3-5 Characters )
            </p>
            <Form.Item
              name="logoImage"
              rules={[
                { required: false, message: "Please Upload Token Image!" },
              ]}
            >
              <ImageUploader formInstance={form} />
            </Form.Item>

            <div className="description-box">
              <p className="description-title">Bonding Curves</p>
              <p className="description-content">
                A bonding curve is a mathematical model that governs the
                relationship between the price and supply of a token in a
                decentralized system
              </p>
              <p className="description-title">Token Features</p>
              <p className="description-content">
                In a bonding curve, as the token supply of token increases, the
                price typically rises, and as the token supply decreases, the
                price decreases.
              </p>
            </div>
            <div className="curve-section">
              <Form.Item
                name="curveType"
                rules={[
                  { required: true, message: "Please select Curve Type!" },
                ]}
              >
                <Select
                  className="select-option"
                  onChange={handleChange}
                  options={curveOptions}
                />
              </Form.Item>
              {curve && (
                <div className="graph">
                  <Graph
                    previewOnly={true}
                    cap={100}
                    increment={10}
                    {...curveData[curve as keyof typeof curveData]}
                  />
                </div>
              )}
            </div>
            <div className="other-details-section">
              <p className="details-title">Other Details</p>
              <div className="form-fields">
                <Form.Item
                  label="Cap"
                  name="totalSupply"
                  rules={[
                    { required: true, message: "Please enter Total Supply!" },
                  ]}
                >
                  <Input
                    className="input-box"
                    type="number"
                    placeholder="Eg., 1000000"
                  />
                </Form.Item>
                <Form.Item
                  label="Precision"
                  name="precision"
                  rules={[
                    {
                      required: true,
                      message: errorMessages.precisionRequired,
                    },
                  ]}
                >
                  <Input
                    className="input-box"
                    type="number"
                    placeholder="Eg., 100"
                  />
                </Form.Item>
                <Form.Item
                  label="Vesting Period"
                  name="vestingPeriod"
                  rules={[
                    { required: true, message: "Please input Vesting Period!" },
                  ]}
                >
                  <Select
                    className="vesting-option input-box"
                    options={vestingPeriodOptions}
                  />
                </Form.Item>
              </div>
              <p className="price-estimation price-text">
                Price Estimation :{" "}
                {getLaunchpadPriceEstimate(precision, curve) + " USD"}
              </p>
              <div className="d-flex justify-content-center">
                <Button htmlType="submit" className="mint-button">
                  Mint Token
                </Button>

                <TransactionModal
                  handleCancel={handleCancel}
                  isClosable={isClosable}
                  isModalOpen={isModalOpen}
                  transactionType="Deploy"
                  hash={hash}
                />
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LaunchPad;
