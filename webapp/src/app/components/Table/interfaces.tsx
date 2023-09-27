import type { ColumnsType } from "antd/es/table";
import { AllBalanceType } from "../../../utils/types";
import { DeployedTokensList } from "../../containers/UserDashboard/types";

export interface Key {
  key: React.Key;
}

export interface DeployedDataProps extends Key {
  token: string;
  totalSupply: number;
  curveType: string;
  vestingPeriod: string;
  base: string;
  balance: number;
}

export interface ClaimableDataProps extends Key {
  tokenName: string;
  noOfTokens: number;
}

export interface TableComponentProps {
  columns: ColumnsType<
    DeployedDataProps | ClaimableDataProps | DeployedTokensList | AllBalanceType
  >;
  dataSource:
    | DeployedDataProps[]
    | ClaimableDataProps[]
    | DeployedTokensList[]
    | AllBalanceType[];
  classname: string;
}
