import { Button, Tag } from "antd";
import { BigNumber, ethers } from "ethers";

export const deployedColumns = [
  {
    title: "Token",
    dataIndex: "token",
    key: "token",
    render: (text: string) => <div style={{ fontWeight: "bold" }}>{text}</div>,
  },
  {
    title: "Total Supply",
    dataIndex: "totalSupply",
    key: "totalSupply",
  },
  {
    title: "Curve Type",
    dataIndex: "curveType",
    key: "curveType",
    render: (curve: string) => {
      let color = "";
      switch (curve) {
        case "Linear":
          color = "#ff8da1";
          break;
        case "Sub-Linear":
          color = "#a0a0a0";
          break;
        case "Polynomial":
          color = "#ffba3b";
          break;
        case "S-Curve":
          color = "#4ff4a2";
          break;
        default:
          color = "#ff0040";
      }
      return (
        <Tag color={color} className="tag">
          {curve}
        </Tag>
      );
    },
  },
  {
    title: "Vesting Period",
    dataIndex: "vestingPeriod",
    key: "vestingPeriod",
  },
];

export const claimableColumns = [
  {
    title: "Token Name",
    dataIndex: "tokenName",
    key: "tokenName",
    render: (text: string) => <div style={{ fontWeight: "bold" }}>{text}</div>,
  },
  {
    title: "No Of Tokens",
    dataIndex: "unlockableBalance",
    key: "unlockableBalance",
    render: (text: BigNumber) =>
      Number(ethers.utils.formatEther(text.toString())),
  },
  {
    title: "",
    dataIndex: "unlockableBalance",
    key: "unlockableBalance",
    render: (text: BigNumber) => (
      <div className="d-flex justify-content-center align-items-center">
        <Button type="primary" style={{ background: "#4e5ad4" }}>
          Claim
        </Button>
      </div>
    ),
  },
];
