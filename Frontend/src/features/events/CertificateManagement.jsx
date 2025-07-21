import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import CertificateGenerator from '../../shared/components/CertificateGenerator';

const CertificateManagement = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <CertificateGenerator />
      </Paper>
    </Container>
  );
};

export default CertificateManagement;