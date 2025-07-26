import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Grid,
  TextField,
  IconButton,
  Box,
  Paper,
  useTheme,
  alpha,
  Divider,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Delete,
  Add,
  Receipt,
  MonetizationOn,
  TrendingUp,
  ExpandMore,
  AccountBalance
} from '@mui/icons-material';

const ClaimBillDialog = ({
  open,
  onClose,
  claimData,
  setClaimData,
  incomeData,
  setIncomeData,
  selectedProgramme,
  onSubmit
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const inputRefs = useRef({});

  // Create local state to prevent re-render issues
  const [localIncomeData, setLocalIncomeData] = useState([]);
  const [localClaimData, setLocalClaimData] = useState([]);

  // Sync with parent state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalIncomeData(incomeData || []);
      setLocalClaimData(claimData || []);
    }
  }, [open, incomeData, claimData]);

  // Sync local changes back to parent
  useEffect(() => {
    if (localIncomeData.length > 0) {
      setIncomeData(localIncomeData);
    }
  }, [localIncomeData, setIncomeData]);

  useEffect(() => {
    if (localClaimData.length > 0) {
      setClaimData(localClaimData);
    }
  }, [localClaimData, setClaimData]);

  const handleClaimChange = useCallback((field, value, idx) => {
    setLocalClaimData((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  }, []);

  const handleIncomeChange = useCallback((field, value, idx) => {
    setLocalIncomeData((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  }, []);

  const calculateIncome = useCallback((idx) => {
    setLocalIncomeData((prev) => {
      const updated = [...prev];
      const item = updated[idx];
      
      const expectedParticipants = Number(item.expectedParticipants || 0);
      const perParticipantAmount = Number(item.perParticipantAmount || 0);
      const gstPercentage = Number(item.gstPercentage || 0);
      
      if (expectedParticipants > 0 && perParticipantAmount > 0) {
        const baseIncome = expectedParticipants * perParticipantAmount;
        const gstAmount = baseIncome * (gstPercentage / 100);
        updated[idx].income = Math.round((baseIncome + gstAmount) * 100) / 100;
      }
      
      return updated;
    });
  }, []);

  const handleAddClaimExpense = useCallback(() => {
    setLocalClaimData((prev) => [...prev, { category: "", amount: "" }]);
  }, []);

  const handleDeleteClaimExpense = useCallback((idx) => {
    if (localClaimData.length > 1) {
      setLocalClaimData((prev) => prev.filter((_, i) => i !== idx));
    }
  }, [localClaimData.length]);

  const handleAddIncomeSource = useCallback(() => {
    setLocalIncomeData((prev) => [...prev, { 
      category: "", 
      expectedParticipants: "", 
      perParticipantAmount: "", 
      gstPercentage: 0,
      income: "" 
    }]);
  }, []);

  const handleDeleteIncomeSource = useCallback((idx) => {
    if (localIncomeData.length > 1) {
      setLocalIncomeData((prev) => prev.filter((_, i) => i !== idx));
    }
  }, [localIncomeData.length]);

  const totalExpenditure = localClaimData.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const totalIncome = localIncomeData.reduce(
    (sum, item) => sum + Number(item.income || 0),
    0
  );

  const universityOverhead = totalIncome * 0.3;
  const netIncome = totalIncome - universityOverhead - totalExpenditure;

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  const handleSubmit = useCallback(() => {
    // Sync final data before submit
    setIncomeData(localIncomeData);
    setClaimData(localClaimData);
    onSubmit();
  }, [localIncomeData, localClaimData, setIncomeData, setClaimData, onSubmit]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1)
            }}
          >
            <Receipt color="primary" />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              📋 Quick Claim Submission
            </Typography>
            {selectedProgramme && (
              <Typography variant="body2" color="text.secondary">
                Event: {selectedProgramme.title}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 0 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="💰 Income Sources" 
            icon={<TrendingUp />} 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab 
            label="💸 Expenses" 
            icon={<Receipt />} 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>

        {/* Income Tab */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            Income Sources & Revenue
          </Typography>

          <Box sx={{ mb: 3 }}>
            {localIncomeData && localIncomeData.map((item, idx) => (
              <Paper
                key={`income-${idx}`}
                sx={{
                  p: 3,
                  mb: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Income Category"
                      fullWidth
                      defaultValue={item.category || ''}
                      onChange={(e) => handleIncomeChange("category", e.target.value, idx)}
                      placeholder="e.g., Registration Fees, Sponsorship, etc."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Expected Participants"
                      fullWidth
                      defaultValue={item.expectedParticipants || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        handleIncomeChange("expectedParticipants", value, idx);
                      }}
                      onBlur={() => calculateIncome(idx)}
                      placeholder="e.g., 50"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Per Participant Amount (₹)"
                      fullWidth
                      defaultValue={item.perParticipantAmount || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        handleIncomeChange("perParticipantAmount", value, idx);
                      }}
                      onBlur={() => calculateIncome(idx)}
                      placeholder="e.g., 1000"
                      InputProps={{
                        startAdornment: <MonetizationOn sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="GST (%)"
                      fullWidth
                      defaultValue={item.gstPercentage || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        if (Number(value) <= 100 || value === '') {
                          handleIncomeChange("gstPercentage", value, idx);
                        }
                      }}
                      onBlur={() => calculateIncome(idx)}
                      placeholder="e.g., 18"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Total Income (₹)"
                      fullWidth
                      value={item.income || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        handleIncomeChange("income", value, idx);
                      }}
                      placeholder="Auto-calculated or manual entry"
                      InputProps={{
                        startAdornment: <AccountBalance sx={{ mr: 1, color: 'success.main' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.success.main, 0.05)
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteIncomeSource(idx)}
                      disabled={localIncomeData.length === 1}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.1)
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
                
                {/* Calculate Button */}
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => calculateIncome(idx)}
                    disabled={!item.expectedParticipants || !item.perParticipantAmount}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2
                    }}
                  >
                    🧮 Calculate Income
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>

          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddIncomeSource}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              mb: 3,
              borderColor: theme.palette.success.main,
              color: theme.palette.success.main,
              '&:hover': {
                borderColor: theme.palette.success.dark,
                backgroundColor: alpha(theme.palette.success.main, 0.1)
              }
            }}
          >
            Add Income Source
          </Button>
        </TabPanel>

        {/* Expenses Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            Expense Categories
          </Typography>

          <Box sx={{ mb: 3 }}>
            {localClaimData && localClaimData.map((item, idx) => (
              <Paper
                key={`expense-${idx}`}
                sx={{
                  p: 2,
                  mb: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <TextField
                      label="Expense Category"
                      fullWidth
                      defaultValue={item.category || ''}
                      onChange={(e) => handleClaimChange("category", e.target.value, idx)}
                      placeholder="e.g., Refreshments, Materials, etc."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      label="Amount (₹)"
                      fullWidth
                      defaultValue={item.amount || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        handleClaimChange("amount", value, idx);
                      }}
                      placeholder="e.g., 5000"
                      InputProps={{
                        startAdornment: <MonetizationOn sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClaimExpense(idx)}
                      disabled={localClaimData.length === 1}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.1)
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>

          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddClaimExpense}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              mb: 3
            }}
          >
            Add Expense Category
          </Button>
        </TabPanel>

        <Divider sx={{ my: 3 }} />

        {/* Financial Summary */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              📊 Financial Summary
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    borderRadius: 2,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Income
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    ₹{totalIncome.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    borderRadius: 2,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    University Overhead (30%)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                    ₹{universityOverhead.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    borderRadius: 2,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Expenses
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                    ₹{totalExpenditure.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderRadius: 2,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Net Balance
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700, 
                      color: netIncome >= 0 ? theme.palette.success.main : theme.palette.error.main 
                    }}
                  >
                    ₹{netIncome.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 3, 
          borderTop: `1px solid ${theme.palette.divider}`,
          gap: 2
        }}
      >
        <Button 
          onClick={onClose}
          sx={{ 
            borderRadius: 2,
            px: 3,
            textTransform: 'none'
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={
            !localClaimData.some(item => item.category && item.amount) ||
            !localIncomeData.some(item => item.category && (item.income || (item.expectedParticipants && item.perParticipantAmount)))
          }
          sx={{ 
            borderRadius: 2,
            px: 4,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Submit Claim with Income Data
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClaimBillDialog;