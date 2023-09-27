import { CurveTypes } from "../../components/Graphs/constants";

export type DeployedTokensList = {
  key: number;
  token: string;
  totalSupply: string;
  curveType: CurveTypes | string;
  vestingPeriod: string;
};
