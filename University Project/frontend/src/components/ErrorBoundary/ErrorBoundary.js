import React from 'react';
import { Box, Typography, Button, Alert, AlertTitle } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: this.props.fullScreen ? '100vh' : '200px',
            p: 3,
            textAlign: 'center'
          }}
        >
          <Alert 
            severity="error" 
            sx={{ 
              maxWidth: 600, 
              width: '100%',
              mb: 2
            }}
            icon={<ErrorOutline />}
          >
            <AlertTitle>Something went wrong</AlertTitle>
            {this.props.showDetails && this.state.error ? (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {this.state.error.message}
              </Typography>
            ) : (
              <Typography variant="body2">
                An unexpected error occurred in this component. Please try refreshing or contact support if the problem persists.
              </Typography>
            )}
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={this.handleRetry}
              startIcon={<Refresh />}
              size="small"
            >
              Try Again
            </Button>
            
            <Button
              variant="contained"
              onClick={this.handleReload}
              size="small"
            >
              Reload Page
            </Button>
          </Box>

          {/* Development mode error details */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: 'grey.100',
                borderRadius: 1,
                maxWidth: 800,
                width: '100%',
                textAlign: 'left'
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Error Details (Development Mode):
              </Typography>
              <Typography variant="body2" component="pre" sx={{ 
                fontSize: '0.75rem',
                overflow: 'auto',
                maxHeight: 200,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.defaultProps = {
  fullScreen: false,
  showDetails: false
};

export default ErrorBoundary;
