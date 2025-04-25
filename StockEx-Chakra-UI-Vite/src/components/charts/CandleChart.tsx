import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

import { fetchHistoricalStockPrice } from '@/utils/data/stocks/stockHistorical';

type CandleChartProps = {
   stock: string; // Accept stock ticker symbol
};

const CandleChart: React.FC<CandleChartProps> = ({ stock }) => {
   const [chartData, setChartData] = useState<any[]>([]);
   const [yAxisRange, setYAxisRange] = useState<{ min: number; max: number }>({ min: 0, max: 10 });

   useEffect(() => {
      const fetchData = async () => {
         const response = await fetchHistoricalStockPrice(stock);
         if (response && response.values) {

            // Get the date one year ago from today
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

            // Filter data to include only candles from the past year
            const filteredValues = response.values.filter((entry) => {
               const entryDate = new Date(entry.datetime);
               return entryDate >= oneYearAgo;
            });

            console.log("filteredValues:", filteredValues);


            const formattedData = filteredValues.map((entry) => ({
               x: new Date(entry.datetime),
               y: [
                  parseFloat(entry.open),
                  parseFloat(entry.high),
                  parseFloat(entry.low),
                  parseFloat(entry.close),
               ],
            }));

            setChartData(formattedData);

            // Set initial Y-axis range based on the filtered data
            const allYValues = formattedData.flatMap(candle => candle.y);
            const minY = Math.min(...allYValues);
            const maxY = Math.max(...allYValues);
            const offset = maxY * 0.2;
            setYAxisRange({
               min: Math.max(minY - offset, 0),
               max: maxY + offset,
            });
         }
      };

      fetchData();
   }, [stock]);

   const chartOptions: ApexCharts.ApexOptions = {
      chart: {
        type: 'candlestick',
        events: {
            zoomed: (chartContext: any, { xaxis }: { xaxis: { min: number; max: number } }) => {
               // Get visible candles based on the zoom range
               const visibleCandles = chartData.filter(candle => {
                  const candleDate = candle.x.getTime();
                  return candleDate >= xaxis.min && candleDate <= xaxis.max;
               });
   
            // Update Y-axis range based on the visible candles
            //    if (visibleCandles.length > 0) {
            //       const visibleYValues = visibleCandles.flatMap(candle => candle.y);
            //       const minY = Math.min(...visibleYValues);
            //       const maxY = Math.max(...visibleYValues);
            //       setYAxisRange({
            //          min: Math.max(minY - minY*0.1, 0),
            //          max: maxY + maxY*0.1,
            //       });
            //    }
            
            },
            scrolled: (chartContext: any, { xaxis }: { xaxis: { min: number; max: number } }) => {
               // Same logic for scrolling
               const visibleCandles = chartData.filter(candle => {
                  const candleDate = candle.x.getTime();
                  return candleDate >= xaxis.min && candleDate <= xaxis.max;
               });
   
               if (visibleCandles.length > 0) {
                  const visibleYValues = visibleCandles.flatMap(candle => candle.y);
                  const minY = Math.min(...visibleYValues);
                  const maxY = Math.max(...visibleYValues);
                  setYAxisRange({
                     min: Math.max(minY - minY*0.1, 0),
                     max: maxY + maxY*0.1,
                  });
               }
            }
        }
      },
      title: {
        text: 'Stock Candle Chart',
        align: 'left',
        style: {
          color: '#FFFFFF',
          fontSize: '20px',
        },
      },
      xaxis: {
        type: 'datetime',
        range: 7776000000, // Display an initial range (e.g., ~90 days)
        labels: {
          style: {
            colors: '#FFFFFF',  // Change color to white
            fontSize: '12px',    // Increase font size
          },
        },
        axisBorder: {
          color: '#FFFFFF',  // Make axis border white
        },
      },
      yaxis: {
        min: yAxisRange.min,
        max: yAxisRange.max,
        tooltip: {
          enabled: true,
        },
        labels: {
          formatter: (value: number) => value.toFixed(2), // Set precision to 2 decimals
          style: {
            colors: '#FFFFFF',  // Change color to white
            fontSize: '12px',    // Increase font size
          },
        },
        axisBorder: {
          color: '#FFFFFF',  // Make axis border white
        },
      },
      tooltip: {
         enabled: true,
         theme: 'dark', // Ensure the tooltip has a dark theme
         style: {
           fontSize: '12px', // Font size for tooltip text
         },
         marker: {
           show: true,
         },
         onDatasetHover: {
           highlightDataSeries: true,
         },
         fillSeriesColor: true, // Fill the tooltip background with the series color
       },
    };

   return (
      <ReactApexChart
         options={chartOptions}
         series={[{ data: chartData }]}
         type="candlestick"
         height={'100%'}
      />
   );
};

export default CandleChart;
