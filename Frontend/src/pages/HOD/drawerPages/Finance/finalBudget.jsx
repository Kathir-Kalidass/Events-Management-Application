import React from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, IconButton } from '@mui/material';

const FinalBudget = ({activePage, setActivePage}) => {


  function handleBackToFinancePage(){
    setActivePage("finance");
  }

  return (
    <Box>
      <IconButton 
        onClick={handleBackToFinancePage}
        sx={{
          m:1,
        }}
      >
        <ArrowBackIcon></ArrowBackIcon>
      </IconButton>
    </Box>
  )
}

export default FinalBudget