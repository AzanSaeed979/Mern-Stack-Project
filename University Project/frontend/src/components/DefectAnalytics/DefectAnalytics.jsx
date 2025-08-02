import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDefects } from '../../redux/actions/defectActions';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Box, Typography, CircularProgress } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

const DefectAnalytics = () => {
  const dispatch = useDispatch();
  const defects = useSelector(state => state.defects.defects);
  const loading = useSelector(state => !state.defects.defects.length);

  useEffect(() => {
    dispatch(fetchDefects());
  }, [dispatch]);

  if (loading) {
    return <CircularProgress />;
  }

  // Aggregate defects by type
  const defectCounts = defects.reduce((acc, defect) => {
    acc[defect.defectType] = (acc[defect.defectType] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(defectCounts),
    datasets: [
      {
        data: Object.values(defectCounts),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Defect Distribution
      </Typography>
      <Pie data={data} />
    </Box>
  );
};

export default DefectAnalytics;