import React from 'react';
import { Grid, Typography } from '@mui/material';
import CameraCapture from '../CameraCapture/CameraCapture';
import ProductionLineStats from '../ProductionLineStats/ProductionLineStats';

const RealTimeMonitoring = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Typography variant="h5" gutterBottom>
          Line 1 - Assembly
        </Typography>
        <CameraCapture productionLine="assembly-1" />
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="h5" gutterBottom>
          Production Stats
        </Typography>
        <ProductionLineStats />
      </Grid>
    </Grid>
  );
};

export default RealTimeMonitoring;