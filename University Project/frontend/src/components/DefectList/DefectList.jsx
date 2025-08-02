import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDefects, resolveDefect } from '../../redux/actions/defectActions';
import { 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Typography, 
  Button,
  CircularProgress,
  Box
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';

const DefectList = () => {
  const dispatch = useDispatch();
  const defects = useSelector(state => state.defects.defects);
  const loading = useSelector(state => !state.defects.defects.length);

  useEffect(() => {
    dispatch(fetchDefects());
  }, [dispatch]);

  const handleResolve = (id) => {
    dispatch(resolveDefect(id));
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Recent Defects
      </Typography>
      <List>
        {defects.map(defect => (
          <ListItem 
            key={defect._id} 
            secondaryAction={
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => handleResolve(defect._id)}
              >
                Resolve
              </Button>
            }
          >
            <ListItemAvatar>
              <Avatar src={defect.imageUrl}>
                <ImageIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={defect.defectType}
              secondary={
                <>
                  <Typography component="span" variant="body2" color="textPrimary">
                    Line: {defect.productionLine}
                  </Typography>
                  <br />
                  {`Probability: ${Math.round(defect.probability * 100)}%`}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default DefectList;