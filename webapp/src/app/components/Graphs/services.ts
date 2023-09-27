import { CurveTypes, GraphProps, GraphData } from "./constants";

export const getCurveData = (props: GraphProps) => {
  const { cap, increment, slope, intercept, type, a, n, c1, c2 } = props;
  const data: GraphData[] = [];
  let totalSupply = 0;
  let price = 0;

  while (totalSupply <= cap) {
    data.push({
      totalSupply,
      price,
    });

    totalSupply += increment;

    if (type === CurveTypes.linear && slope && intercept) {
      price = Number((slope * totalSupply + intercept).toFixed(3));
    } else if (type === CurveTypes.polynomial && a && n) {
      price = Number(Math.pow(a * totalSupply, n).toFixed(3));
    } else if (type === CurveTypes.subLinear && n) {
      price = Number(Math.pow(totalSupply, n).toFixed(3));
    } else if (type === CurveTypes.sCurve && c1 && c2) {
      price = Number((1 / Math.exp(-c1 * (totalSupply - c2))).toFixed(3));
    } else {
      price = 0;
    }
  }

  const x1 = 40;
  const x2 = 60;

  const startDataPoint = data.find((entry) => entry.totalSupply === x1);
  const endDataPoint = data.find((entry) => entry.totalSupply === x2);
  return { data, startDataPoint, endDataPoint, x1, x2 };
};
