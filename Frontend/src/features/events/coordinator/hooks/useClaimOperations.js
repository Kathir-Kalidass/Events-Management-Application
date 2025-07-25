import { useState, useCallback } from 'react';
import axios from 'axios';

export const useClaimOperations = (setEvents, enqueueSnackbar) => {
  const [claimData, setClaimData] = useState([]);
  const [openClaimDialog, setOpenClaimDialog] = useState(false);
  const [selectedProgramme, setSelectedProgramme] = useState(null);

  const handleApplyClaim = useCallback((programme) => {
    setSelectedProgramme(programme);
    
    // Check if there are existing claim bill expenses, otherwise use budget breakdown expenses
    let expensesToUse = [];
    
    if (programme.claimBill && programme.claimBill.expenses && programme.claimBill.expenses.length > 0) {
      // If claim bill already exists, use those expenses for editing
      expensesToUse = programme.claimBill.expenses.map(expense => ({
        category: expense.category || '',
        amount: expense.amount || ''
      }));
    } else if (programme.budgetBreakdown && programme.budgetBreakdown.expenses && programme.budgetBreakdown.expenses.length > 0) {
      // Use original budget breakdown expenses as starting point
      expensesToUse = programme.budgetBreakdown.expenses.map(expense => ({
        category: expense.category || '',
        amount: expense.amount || ''
      }));
    } else {
      // Default to one empty expense row
      expensesToUse = [{ category: "", amount: "" }];
    }

    setClaimData(expensesToUse);
    setOpenClaimDialog(true);
  }, []);

  const handleSubmitClaim = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:4000/api/coordinator/claims/${selectedProgramme._id}`,
        {
          expenses: claimData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      enqueueSnackbar("Claim Bill submitted successfully! The HOD will see the updated financial data.", {
        variant: "success",
      });
      
      // Update the local event data to reflect the submission
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === selectedProgramme._id 
            ? { 
                ...event, 
                claimBill: { expenses: claimData },
                budgetBreakdown: {
                  ...event.budgetBreakdown,
                  expenses: claimData,
                  totalExpenditure: claimData.reduce((sum, item) => sum + Number(item.amount || 0), 0)
                }
              }
            : event
        )
      );
      
      setOpenClaimDialog(false);
      
      // Refetch data from server to ensure consistency
      setTimeout(async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get("http://localhost:4000/api/coordinator/programmes", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setEvents(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          console.error("Failed to refresh events after claim submission:", error);
        }
      }, 1000);
      
      // Clear the claim data form - reset to default
      setClaimData([{ category: "", amount: "" }]);
      setSelectedProgramme(null);
    } catch (error) {
      console.error("Claim submission error:", error);
      enqueueSnackbar("Failed to submit claim bill", { variant: "error" });
    }
  }, [claimData, selectedProgramme, setEvents, enqueueSnackbar]);

  const handleViewFinalBudget = useCallback((id) => {
    const token = localStorage.getItem("token");
  
    fetch(`http://localhost:4000/api/coordinator/claims/${id}/pdf`, {
      method: "GET",
      headers: {
        'Accept': 'application/pdf',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/pdf')) {
          throw new Error('Response is not a PDF file');
        }
        
        return res.blob();
      })
      .then((blob) => {
        if (blob.size === 0) {
          throw new Error('Received empty PDF file');
        }
        
        const pdfUrl = URL.createObjectURL(blob);
        const newWindow = window.open(pdfUrl);
        
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          // Fallback: trigger download instead
          const link = document.createElement('a');
          link.href = pdfUrl;
          link.download = `ClaimBill_${id}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          enqueueSnackbar('PDF downloaded successfully!', { variant: 'success' });
        }

        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 4000);
      })
      .catch((err) => {
        console.error("Error fetching PDF:", err.message);
        
        if (err.message.includes('Failed to fetch')) {
          enqueueSnackbar('Network error: Please check your internet connection and try again.', { variant: 'error' });
        } else if (err.message.includes('404')) {
          enqueueSnackbar('PDF not found: The requested document may not exist.', { variant: 'error' });
        } else if (err.message.includes('500')) {
          enqueueSnackbar('Server error: Please try again later or contact support.', { variant: 'error' });
        } else {
          enqueueSnackbar(`Failed to load PDF: ${err.message}`, { variant: 'error' });
        }
      });
  }, [enqueueSnackbar]);

  return {
    claimData,
    setClaimData,
    openClaimDialog,
    setOpenClaimDialog,
    selectedProgramme,
    setSelectedProgramme,
    handleApplyClaim,
    handleSubmitClaim,
    handleViewFinalBudget
  };
};