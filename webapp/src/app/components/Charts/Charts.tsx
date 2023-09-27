import { Spin } from "antd";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { BigNumber, ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { sections } from "../../../utils/constants";
import {
  selectCurrentTokenDetails,
  selectTokenAmount,
} from "../../slice/factory/factory.selector";
import { props } from "../Buy-Withdraw/index";

import "./index.scss";

ChartJS.register([
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
]);

type chartData = {
  x: number;
  y: number;
};

const Charts = (props: props) => {
  const [chartDataSet, setChartDataSet] = useState<chartData[]>([]);
  const [referenceArea, setReferenceArea] = useState<chartData[]>([]);

  const chartColors = {
    grey: "#f7f7f7",
    white: "#ffffff",
    primaryBlue: "#2f3ece",
    primaryYellow: "#f3f264",
    pureYellow: "#d5ff00",
  };

  const tokenDetails = useSelector(selectCurrentTokenDetails);
  const tokenAmount = useSelector(selectTokenAmount);

  const setChartData = useCallback(() => {
    if (tokenDetails) {
      const cap = BigNumber.from(tokenDetails.cap);
      let totalSupply = BigNumber.from(0);
      const precision = BigNumber.from(tokenDetails.precision);
      const curveType = tokenDetails.curveType;
      const data: chartData[] = [];
      let price = 0;
      const increment = cap.div(10);

      while (totalSupply.lte(cap)) {
        if (curveType === 1) {
          price = Number(ethers.utils.formatEther(totalSupply.div(precision)));
        } else if (curveType === 4) {
          price = Number(
            ethers.utils.formatEther(
              totalSupply.pow(2).div(BigNumber.from(10).pow(18)).div(precision)
            )
          );
        } else {
          price = 0;
        }
        data.push({
          x: Number(ethers.utils.formatEther(totalSupply)),
          y: price,
        });

        totalSupply = totalSupply.add(increment);
      }
      setChartDataSet(data);
    }
  }, [tokenDetails]);

  useEffect(() => {
    setChartData();
  }, [tokenDetails, setChartData]);

  const getReferenceArea = useCallback(async () => {
    setReferenceArea([]);
    if (tokenDetails && tokenAmount) {
      let currentSupply = BigNumber.from(tokenDetails.totalSupply);
      const cap = BigNumber.from(tokenDetails.cap);
      const amountOfToken = ethers.utils.parseEther(tokenAmount.toString());
      let data: chartData[] = [];

      data.push({
        x: Number(currentSupply.div(BigNumber.from(10).pow(18))),
        y: 0,
      });
      if (props.tab === sections.buy) {
        currentSupply = currentSupply.add(amountOfToken);
        if (currentSupply.lte(cap)) {
          data.push({
            x: Number(currentSupply.div(BigNumber.from(10).pow(18))),
            y: 0,
          });
        } else {
          data = [];
        }
      } else if (props.tab === sections.withdraw) {
        if (currentSupply.gte(amountOfToken)) {
          currentSupply = currentSupply.sub(amountOfToken);
          data.push({
            x: Number(currentSupply.div(BigNumber.from(10).pow(18))),
            y: 0,
          });
        } else {
          data = [];
        }
      } else {
        data = [];
      }
      setReferenceArea(data);
    }
  }, [tokenAmount, tokenDetails, props.tab]);

  useEffect(() => {
    if (tokenAmount) {
      getReferenceArea();
    }
  }, [getReferenceArea, tokenAmount]);

  const chartData = {
    datasets: [
      {
        label: "Price",
        data: chartDataSet,
        backgroundColor: chartColors.white,
        borderColor: chartColors.primaryYellow,
        tension: 0.4,
        fill: false,
      },
      {
        label: "Price Range",
        data: referenceArea,
        backgroundColor: chartColors.primaryYellow,
        borderColor: chartColors.primaryYellow,
        borderWidth: 0,
        fill: "-1",
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
      filler: { propagate: false },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        grid: {
          color: chartColors.white,
        },
        ticks: {
          color: chartColors.white,
        },
        title: {
          display: true,
          text: "Price",
          color: chartColors.white,
        },
      },
      x: {
        type: "linear" as const,
        display: true,
        grid: {
          color: chartColors.white,
        },
        ticks: {
          color: chartColors.white,
        },
        title: {
          display: true,
          text: "Total Supply",
          color: chartColors.white,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="charts">
      {chartDataSet.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center h-100">
          <Spin />
        </div>
      ) : (
        <Line data={chartData} options={options} />
      )}
    </div>
  );
};

export default Charts;
