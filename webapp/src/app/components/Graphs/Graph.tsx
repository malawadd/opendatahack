import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
} from "recharts";

import { GraphProps, strokeColors } from "./constants";
import { getCurveData } from "./services";

import "./index.scss";

const Graph = (props: GraphProps) => {
  const { legend = false, previewOnly } = props;

  const { data, endDataPoint, startDataPoint, x1, x2 } = useMemo(
    () => getCurveData(props),
    [props]
  );

  const startYValue = startDataPoint ? startDataPoint.price : null;
  const endYValue = endDataPoint ? endDataPoint.price : null;

  return (
    <div>
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="totalSupply"
          tick={{ fill: previewOnly ? strokeColors.grey : strokeColors.white }}
          axisLine={{
            stroke: previewOnly ? strokeColors.grey : strokeColors.white,
          }}
        />
        <YAxis
          dataKey="price"
          tick={{ fill: previewOnly ? strokeColors.grey : strokeColors.white }}
          axisLine={{
            stroke: previewOnly ? strokeColors.grey : strokeColors.white,
          }}
        />

        <Tooltip
          labelStyle={{ color: "#2f3ece" }}
          itemStyle={{ color: "#2f3ece" }}
          formatter={function (value, name) {
            return `${value}`;
          }}
          labelFormatter={function (value) {
            return `Total Supply: ${value}`;
          }}
        />
        {legend ? <Legend /> : <></>}
        <Line
          type="monotone"
          dataKey="price"
          stroke={previewOnly ? strokeColors.green : strokeColors.lemon}
          activeDot={{ r: 5 }}
          strokeWidth={3}
          data
        />
        {!previewOnly && startYValue && endYValue && (
          <ReferenceArea
            x1={x1}
            x2={x2}
            y1={0}
            y2={Math.max(startYValue, endYValue)}
            fill={strokeColors.lemon}
            fillOpacity={0.5}
          />
        )}
      </LineChart>
    </div>
  );
};

export default Graph;
