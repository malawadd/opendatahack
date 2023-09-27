import { LoadingOutlined } from "@ant-design/icons";
import { Modal, Spin } from "antd";
import { memo } from "react";
import { useSelector } from "react-redux";
import { selectNetwork } from "../../slice/wallet.selector";
import { chainList, explorerList } from "../../../utils/constants";

type TransactionModalProps = {
  hash?: string;
  isModalOpen: boolean;
  handleCancel: () => void;
  isClosable: boolean;
  transactionType: "Deploy" | "Buy" | "Withdraw" | "Unlock";
};

function TransactionModal({
  hash,
  isModalOpen,
  handleCancel,
  isClosable,
  transactionType,
}: TransactionModalProps) {
  const { mainnet, testnet } = chainList;
  const { mainnetUrl, testnetUrl } = explorerList;

  const networkId = useSelector(selectNetwork);

  const url =
    networkId === mainnet
      ? `${mainnetUrl}${hash}`
      : networkId === testnet
      ? `${testnetUrl}${hash}`
      : "";

  const loader = (
    <LoadingOutlined
      style={{ fontSize: 22, marginLeft: 15, marginTop: 32 }}
      spin
    />
  );

  return (
    <Modal
      title="Approve Transaction"
      className="approve-modal"
      open={isModalOpen}
      closable={isClosable}
      maskClosable={false}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="modal-content">
        {!hash ? (
          <>
            <div className="d-flex">
              <p className="modal-title">Go to your Wallet</p>
              <Spin indicator={loader} />
            </div>
            <p className="modal-title modal-description">
              You’ll be asked to approve this transaction from your wallet. You
              only need to sign each transaction once to{" "}
              {transactionType.toLowerCase()} your tokens
            </p>
          </>
        ) : (
          <div>
            <p className="modal-title">Transaction Completed Successfully!</p>
            <p className="modal-title modal-description">Transaction Hash</p>
            <a href={url} target="_blank" rel="noreferrer">
              <p className="hash">{hash}</p>
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default memo(TransactionModal);
