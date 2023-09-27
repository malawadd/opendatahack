import { Button, Form, message } from "antd";
import { ethers } from "ethers";
import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Charts from "../Charts/Charts";
import ChipCard from "../ChipCards";
import PriceCard from "../PriceCard";

import { errorMessages, messages, sections } from "../../../utils/constants";
import useFactory from "../../customHooks/useFactory";
import { selectCurrentTokenDetails } from "../../slice/factory/factory.selector";
import { resetFactory } from "../../slice/factory/factory.slice";
import TransactionModal from "../TransactionModal/TransactionModal";

import "./index.scss";
import { selectWalletConnected } from "../../slice/wallet.selector";

export type props = {
  tab: string;
};

type FormData = {
  tokenA: string;
  tokenAAmount: number;
  tokenB: string;
  bondingCurveContract: string;
  tokenBAmount: string;
};

const BuyWithdraw = (props: props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosable, setIsClosable] = useState(false);
  const [hash, setHash] = useState("");

  const [form] = Form.useForm();
  const [slippageValue, setSlippageValue] = useState<string | number>("0%");
  const [loading, setLoading] = useState<boolean>(false);
  const { buyTokens, sellTokens } = useFactory();

  const selectedTokenDetails = useSelector(selectCurrentTokenDetails);
  const walletConnected = useSelector(selectWalletConnected);

  const dispatch = useDispatch();

  const handleSlippageChange = useCallback((value: string | number) => {
    const formattedValue = typeof value === "number" ? `${value}%` : value;
    setSlippageValue(formattedValue);
  }, []);

  const validateFormValue = useCallback((formValues: FormData) => {
    return (
      !formValues.bondingCurveContract ||
      !formValues.tokenA ||
      !formValues.tokenAAmount ||
      !formValues.tokenB ||
      !formValues.tokenBAmount
    );
  }, []);

  const showModal = () => {
    setIsModalOpen(true);
    setIsClosable(false);
  };

  const isBuy = useMemo(() => props.tab === sections.buy, [props.tab]);

  const onBuyOrWithdraw = useCallback(
    async (formValues: FormData) => {
      if (!walletConnected) {
        message.error(errorMessages.walletConnectionRequired);
        return;
      }
      if (validateFormValue(formValues)) return;
      setLoading(true);
      showModal();
      const payload = {
        amount: ethers.utils.parseEther(formValues.tokenAAmount.toString()),
        estimatedPrice: ethers.utils.parseEther(
          formValues.tokenBAmount.toString()
        ),
        tokenA: formValues.tokenA,
        tokenB: formValues.tokenB,
        tokenManager: formValues.bondingCurveContract,
      };

      try {
        let hash: string | undefined = "";
        if (isBuy) {
          hash = await buyTokens(payload);
        } else {
          hash = await sellTokens(payload);
        }
        if (hash) setHash(hash);
        else setIsModalOpen(false);
        dispatch(resetFactory());
      } catch {
      } finally {
        setIsClosable(true);
        setLoading(false);
      }
    },
    [walletConnected, validateFormValue, isBuy, dispatch, buyTokens, sellTokens]
  );

  const { totalSupply, vestingPeriod, currentSupply } = useMemo(() => {
    return {
      currentSupply: ethers.utils.formatEther(
        selectedTokenDetails?.totalSupply ?? "0"
      ),
      vestingPeriod: (selectedTokenDetails?.vestingPeriod ?? "--") + " days",
      totalSupply: ethers.utils.formatEther(selectedTokenDetails?.cap ?? 0),
    };
  }, [
    selectedTokenDetails?.cap,
    selectedTokenDetails?.totalSupply,
    selectedTokenDetails?.vestingPeriod,
  ]);

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
    setHash("");
    setIsClosable(false);
  }, []);

  return (
    <Form form={form} onFinish={onBuyOrWithdraw}>
      <div className="main">
        <div className="buy d-flex justify-content-center">
          <div className="buy-column-1">
            <PriceCard section={props.tab} transactionLoading={loading} />
          </div>
          <div className="buy-column-2">
            <div className="d-flex justify-content-center align-items-center w-100 h-100 m-0">
              <Charts tab={props.tab} />
            </div>
            <label>
              <span className="star">* </span>
              {props.tab === sections.buy
                ? messages.buyGraph
                : messages.withdrawGraph}
            </label>
          </div>
        </div>
        <div className="price-chips d-flex justify-content-center">
          <ChipCard title="CURRENT SUPPLY" value={currentSupply} />
          <ChipCard title="CAP" value={totalSupply} />
          <ChipCard title="VESTING PERIOD" value={vestingPeriod} />
          {/* <ChipCard
            title="SLIPPAGE TOLERANCE"
            value={slippageValue}
            handleSlippageChange={handleSlippageChange}
          /> */}
        </div>
        <div className="d-flex justify-content-center">
          <Button
            className="buy-button"
            htmlType="submit"
            loading={loading}
            disabled={loading}
          >
            {isBuy ? "Buy Now" : "Withdraw"}
          </Button>
        </div>
        <TransactionModal
          handleCancel={handleCancel}
          isClosable={isClosable}
          isModalOpen={isModalOpen}
          transactionType={isBuy ? "Buy" : "Withdraw"}
          hash={hash}
        />
      </div>
    </Form>
  );
};

export default BuyWithdraw;
