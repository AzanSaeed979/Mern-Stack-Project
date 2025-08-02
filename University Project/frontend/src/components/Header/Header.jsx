import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AI Factory Production & Defect Detection
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;