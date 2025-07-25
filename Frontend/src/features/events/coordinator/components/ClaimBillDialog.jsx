import React from 'react';
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
  Divider
} from '@mui/material';
import {
  Delete,
  Add,
  Receipt,
  MonetizationOn
} from '@mui/icons-material';

const ClaimBillDialog = ({
  open,
  onClose,
  claimData,
  setClaimData,
  selectedProgramme,
  onSubmit
}) => {
  const theme = useTheme();

  const handleClaimChange = (field, value, idx) => {
    setClaimData((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleAddClaimExpense = () => {
    setClaimData((prev) => [...prev, { category: "", amount: "" }]);
  };

  const handleDeleteClaimExpense = (idx) => {
    setClaimData((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalExpenditure = claimData.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3
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
              Apply Claim Bill
            </Typography>
            {selectedProgramme && (
              <Typography variant="body2" color="text.secondary">
                Event: {selectedProgramme.title}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Expense Categories
        </Typography>

        <Box sx={{ mb: 3 }}>
          {claimData.map((item, idx) => (
            <Paper
              key={idx}
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
                    value={item.category}
                    onChange={(e) =>
                      handleClaimChange("category", e.target.value, idx)
                    }
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
                    type="number"
                    fullWidth
                    value={item.amount}
                    onChange={(e) =>
                      handleClaimChange("amount", e.target.value, idx)
                    }
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
                    disabled={claimData.length === 1}
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

        <Divider sx={{ my: 3 }} />

        {/* Total Summary */}
        <Paper
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            borderRadius: 2
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
              Total Expenditure
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
              ₹{totalExpenditure.toFixed(2)}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This amount will be submitted for HOD approval
          </Typography>
        </Paper>
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
          onClick={onSubmit}
          disabled={!claimData.some(item => item.category && item.amount)}
          sx={{ 
            borderRadius: 2,
            px: 4,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Submit Claim Bill
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClaimBillDialog;