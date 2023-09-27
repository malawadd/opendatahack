import { RcFile } from "antd/es/upload";
import { CurveTypes } from "../Graphs/constants";

export const curveOptions = [
  { value: "1", label: "Linear" },
  { value: "4", label: "Polynomial" },
  { value: "2", label: "Sub-Linear", disabled: true },
  { value: "3", label: "S-Curve", disabled: true },
];

export const vestingPeriodOptions = [
  { value: "15", label: "15 days" },
  { value: "30", label: "30 days" },
  { value: "45", label: "45 days" },
  { value: "60", label: "60 days" },
];

export const LaunchPadInitialValues = {
  curveType: "1",
  vestingPeriod: "45",
};

export type CurveParams = {
  lockPeriod: number;
  totalSupply: number;
  precision: number; //slope
};

export type LaunchFormData = {
  tokenName: string;
  tokenSymbol: string;
  curveType: number;
  logoImage: RcFile;
  curveParams: CurveParams;
  pairToken: string;
};

export type LaunchFormData2 = {
  tokenName: string;
  tokenSymbol: string;
  curveType: number;
  logoImage: string;
  curveParams: CurveParams;
  pairToken: string;
};

export const curveData = {
  "1": {
    type: CurveTypes.linear,
    slope: 15,
    intercept: 15,
  },
  "2": {
    type: CurveTypes.subLinear,
    n: 0.7,
  },
  "3": {
    type: CurveTypes.sCurve,
    c1: 0.2,
    c2: 10,
  },
  "4": {
    type: CurveTypes.polynomial,
    a: 1,
    n: 2,
  },
};
