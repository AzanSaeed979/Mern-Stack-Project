import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Button, Box, CircularProgress, Typography } from '@mui/material';
import { inspectProduct } from '../../services/api';
import { useDispatch } from 'react-redux';
import { addProduct } from '../../redux/actions/productActions';
import { addDefect } from '../../redux/actions/defectActions';

const CameraCapture = ({ productionLine }) => {
  const webcamRef = useRef(null);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const capture = async () => {
    setLoading(true);
    const imageSrc = webcamRef.current.getScreenshot();
    
    // Convert data URL to blob
    const blob = await fetch(imageSrc).then(res => res.blob());
    const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
    
    try {
      const inspectionResult = await inspectProduct(file, productionLine);
      setResult(inspectionResult);
      
      // Dispatch actions to update state
      dispatch(addProduct({
        ...inspectionResult,
        productionLine,
        timestamp: new Date(),
        _id: inspectionResult.productId
      }));
      
      if (inspectionResult.status === 'rejected') {
        dispatch(addDefect({
          productId: inspectionResult.productId,
          defectType: inspectionResult.defectType,
          probability: inspectionResult.probability,
          imageUrl: inspectionResult.imageUrl,
          productionLine,
          _id: Math.random().toString(36).substr(2, 9) // temporary id
        }));
      }
    } catch (error) {
      console.error('Inspection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width="100%"
        height="auto"
        videoConstraints={{ facingMode: 'environment' }}
      />
      <Button 
        variant="contained" 
        color="primary" 
        onClick={capture}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Capture & Inspect'}
      </Button>
      
      {result && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">
            Result: {result.status === 'approved' ? 'Approved' : 'Rejected'}
          </Typography>
          {result.status === 'rejected' && (
            <Typography>
              Defect: {result.defectType} ({Math.round(result.probability * 100)}%)
            </Typography>
          )}
          <Typography>
            Inspection Time: {result.inspectionTime}ms
          </Typography>
          <img 
            src={result.imageUrl} 
            alt="Captured" 
            style={{ maxWidth: '100%', marginTop: 10 }} 
          />
        </Box>
      )}
    </Box>
  );
};

export default CameraCapture;