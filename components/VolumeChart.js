import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const VolumeChart = ({ wooxData, paradexData }) => {
  // Format data for chart
  const formatChartData = () => {
    // Extract timestamps and format them
    const wooxTimestamps = wooxData?.history?.map(item => {
      const date = new Date(item.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }) || [];
    
    const paradexTimestamps = paradexData?.history?.map(item => {
      const date = new Date(item.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }) || [];
    
    // Combine and deduplicate timestamps
    const allTimestamps = [...new Set([...wooxTimestamps, ...paradexTimestamps])].sort();
    
    // Create volume data arrays
    const wooxVolumes = [];
    const paradexVolumes = [];
    
    // Map volumes to timestamps
    allTimestamps.forEach(timestamp => {
      const wooxItem = wooxData?.history?.find(item => {
        const date = new Date(item.timestamp);
        return `${date.getMonth() + 1}/${date.getDate()}` === timestamp;
      });
      
      const paradexItem = paradexData?.history?.find(item => {
        const date = new Date(item.timestamp);
        return `${date.getMonth() + 1}/${date.getDate()}` === timestamp;
      });
      
      wooxVolumes.push(wooxItem ? wooxItem.volume_usd : 0);
      paradexVolumes.push(paradexItem ? paradexItem.volume_usd : 0);
    });
    
    return {
      labels: allTimestamps,
      datasets: [
        {
          label: 'WooX Volume',
          data: wooxVolumes,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.3,
        },
        {
          label: 'Paradex Volume',
          data: paradexVolumes,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.3,
        },
      ],
    };
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Trading Volume History',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          }
        }
      }
    }
  };
  
  // If no data is available, show a message
  if (!wooxData?.history?.length && !paradexData?.history?.length) {
    return <div className="chart-container">No volume data available</div>;
  }
  
  return (
    <div className="chart-container">
      <Line data={formatChartData()} options={chartOptions} />
    </div>
  );
};

export default VolumeChart;