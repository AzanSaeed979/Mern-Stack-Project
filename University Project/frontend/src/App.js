import React, { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProducts, fetchProductionStats } from './redux/actions/productActions';
import { fetchDefects } from './redux/actions/defectActions';
import { Container, Box, Typography, Grid } from '@mui/material';
import Header from './components/Header/Header';
import RealTimeMonitoring from './components/RealTimeMonitoring/RealTimeMonitoring';
import DefectAnalytics from './components/DefectAnalytics/DefectAnalytics';
import DefectList from './components/DefectList/DefectList';
import ProductList from './components/ProductList/ProductList';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

function App() {
  const dispatch = useDispatch();

  // Memoized data fetching function to prevent unnecessary re-renders
  const fetchInitialData = useCallback(() => {
    try {
      dispatch(fetchProducts());
      dispatch(fetchProductionStats());
      dispatch(fetchDefects());
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <ErrorBoundary fullScreen>
      <div>
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>
        
        <Container maxWidth="xl" sx={{ mt: 3 }}>
          <ErrorBoundary>
            <RealTimeMonitoring />
          </ErrorBoundary>
          
          <Box mt={4}>
            <Typography variant="h4" gutterBottom>
              Defect Analytics
            </Typography>
            <ErrorBoundary>
              <DefectAnalytics />
            </ErrorBoundary>
          </Box>
          
          <Grid container spacing={3} mt={2}>
            <Grid item xs={12} md={6}>
              <ErrorBoundary>
                <DefectList />
              </ErrorBoundary>
            </Grid>
            <Grid item xs={12} md={6}>
              <ErrorBoundary>
                <ProductList />
              </ErrorBoundary>
            </Grid>
          </Grid>
        </Container>
      </div>
    </ErrorBoundary>
  );
}

export default App;