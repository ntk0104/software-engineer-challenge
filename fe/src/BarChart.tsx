import React, { useRef } from "react";
import { Bar } from "react-chartjs-2";
import html2canvas from "html2canvas";
import { Chart, ChartData, ChartOptions, registerables } from "chart.js";

Chart.register(...registerables);

interface BarChartProps {
  labels: string[];
  data: number[];
}

const BarChart: React.FC<BarChartProps> = ({ labels, data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const dataChart: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: "My First dataset",
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(75,192,192,0.6)",
        hoverBorderColor: "rgba(75,192,192,1)",
        data
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleDownloadImage = () => {
    const chartElement = chartRef.current;
    if (chartElement) {
      html2canvas(chartElement).then((canvas) => {
        const link = document.createElement("a");
        link.download = "chart.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div>
      <div ref={chartRef} style={{ width: "100vw", height: "400px" }}>
        <Bar data={dataChart} options={options} />
      </div>
      <button onClick={handleDownloadImage}>Download Chart as Image</button>
    </div>
  );
};

export default BarChart;
