import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductionStats } from '../../redux/actions/productActions';
import { Box, Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material';

const ProductionLineStats = () => {
  const dispatch = useDispatch();
  const stats = useSelector(state => state.production.stats);
  const loading = useSelector(state => !state.production.stats.length);

  useEffect(() => {
    dispatch(fetchProductionStats());
  }, [dispatch]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Grid container spacing={3}>
      {stats.map(line => (
        <Grid item xs={12} sm={6} md={4} key={line._id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Line: {line._id}
              </Typography>
              <Typography>Total Products: {line.total}</Typography>
              <Typography color="success.main">Approved: {line.approved}</Typography>
              <Typography color="error.main">Rejected: {line.rejected}</Typography>
              <Typography>
                Rejection Rate: {((line.rejected / line.total) * 100).toFixed(2)}%
              </Typography>
              <Typography>
                Avg. Inspection Time: {line.avgInspectionTime.toFixed(2)}ms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductionLineStats;