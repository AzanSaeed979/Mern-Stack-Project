import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/actions/productActions';
import { 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Chip,
  CircularProgress,
  Box
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Typography from '@mui/material/Typography'

const ProductList = () => {
  const dispatch = useDispatch();
  const products = useSelector(state => state.production.products);
  const loading = useSelector(state => !state.production.products.length);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Recent Products
      </Typography>
      <List>
        {products.map(product => (
          <ListItem key={product._id}>
            <ListItemAvatar>
              <Avatar src={product.imageUrl}>
                <ImageIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${product.productName} (Line: ${product.productionLine})`}
              secondary={
                <>
                  <Typography component="span" variant="body2" color="textPrimary">
                    {new Date(product.timestamp).toLocaleString()}
                  </Typography>
                  <br />
                  {product.defectType && `Defect: ${product.defectType} (${Math.round(product.defectProbability * 100)}%)`}
                </>
              }
            />
            {product.status === 'approved' ? (
              <Chip icon={<CheckCircleIcon />} label="Approved" color="success" />
            ) : (
              <Chip icon={<CancelIcon />} label="Rejected" color="error" />
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ProductList;