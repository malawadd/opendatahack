export type GraphProps = {
  cap: number;
  increment: number;
  type: string;
  previewOnly: boolean;
  slope?: number;
  intercept?: number;
  legend?: boolean;
  a?: number;
  n?: number;
  c1?: number;
  c2?: number;
};

export enum CurveTypes {
  linear = "Linear",
  polynomial = "Polynomial",
  subLinear = "Sub-Linear",
  sCurve = "S-Curve",
}

export type GraphData = {
  totalSupply: number;
  price: number;
};

export const strokeColors = {
  grey: "#808080",
  white: "#ffffff",
  green: "#6bd28e",
  lemon: "#f3f264",
};
