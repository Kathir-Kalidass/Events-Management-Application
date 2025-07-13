import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Avatar,
  Divider,
  Badge,
  Paper,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  PendingActions,
  AttachFile,
  DateRange,
  People,
  MonetizationOn,
  Approval,
  Receipt,
  AccountBalance,
  EventAvailable,
  Visibility,
  Download,
  FileCopy,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { useSnackbar } from "notistack";
import { eventState } from "../../context/eventProvider";

const CoordinatorDashboard = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { user, setUser } = eventState();
  const [hod, setHod] = useState();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [claimData, setClaimData] = useState([]);
  const [openClaimDialog, setOpenClaimDialog] = useState(false);
  const [selectedProgramme, setSelectedProgramme] = useState(null);

  const [openForm, setOpenForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [view, setView] = useState("home"); // 'home' or 'form'
  
  // Check if we're in edit mode
  const editingEvent = location.state?.editingEvent;
  const isEditMode = location.state?.editMode;
  
  // State for new input fields
  const [newTargetAudience, setNewTargetAudience] = useState("");
  const [newResourcePerson, setNewResourcePerson] = useState("");

  const initialFormState = {
    title: "",
    startDate: "",
    endDate: "",
    venue: "",
    mode: "Online",
    duration: "",
    type: "",
    objectives: "",
    outcomes: "",
    budget: "",
    brochure: "",
    coordinators: [
      { 
        name: user?.name || "", 
        designation: user?.designation || "", 
        department: user?.department || "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)" 
      }
    ],
    targetAudience: [],
    resourcePersons: [],

    // Registration procedure (optional, for brochure generation)
    registrationProcedure: {
      enabled: false,
      instructions: "",
      submissionMethod: "email",
      deadline: "",
      participantLimit: "",
      selectionCriteria: "first come first served basis",
      confirmationDate: "",
      confirmationMethod: "email",
      certificateRequirements: {
        enabled: false,
        attendanceRequired: true,
        evaluation: {
          quiz: { enabled: false, percentage: 0 },
          assignment: { enabled: false, percentage: 0 },
          labWork: { enabled: false, percentage: 0 },
          finalTest: { enabled: false, percentage: 0 }
        }
      },
      additionalNotes: "",
      paymentDetails: {
        enabled: false,
        accountName: "DIRECTOR, CSRC",
        accountNumber: "37614464781",
        accountType: "SAVINGS",
        bankBranch: "State Bank of India, Anna University",
        ifscCode: "SBIN0006463",
        additionalPaymentInfo: ""
      },
      registrationForm: {
        enabled: false,
        fields: {
          name: true,
          ageAndDob: true,
          qualification: true,
          institution: true,
          category: {
            enabled: true,
            options: [
              "Student from a Non-Government School",
              "Student of / who has just passed Class XII from a Government School*",
              "A programming enthusiast"
            ]
          },
          address: true,
          email: true,
          mobile: true,
          signature: true
        },
        additionalRequirements: "*Proof has to be submitted with the application",
        customFields: []
      }
    },

    approvers: [{ name: "", role: "" }],

    // Organizing departments
    organizingDepartments: {
      primary: "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)",
      associative: [], // Can include "CENTRE FOR CYBER SECURITY (CCS)" and others
    },

    // Department approvers for signatures
    departmentApprovers: [
      {
        department: "DCSE",
        hodName: "",
        hodDesignation: "HoD, DCSE & Director, CCS",
        approved: false,
        approvedDate: "",
        signature: ""
      }
    ],

    budgetBreakdown: {
      income: [
        {
          category: "",
          expectedParticipants: "",
          perParticipantAmount: "",
          gstPercentage: "",
          income: 0,
        },
      ],
      expenses: [{ category: "", amount: "" }],
      totalIncome: 0,
      totalExpenditure: "0",
      universityOverhead: "0",
      gstAmount: "",
    },
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const getCurrentHod = () => {
    if(!user){
      return;
    }
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5050/api/coordinator/getHOD?id=${user._id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setHod(data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  function handleViewFinalBudget(id) {

    console.log('Fetching PDF for ID:', id);
    
    const token = localStorage.getItem("token");
  
  fetch(`http://localhost:5050/api/coordinator/claims/${id}/pdf`, {
    method: "GET",
    headers: {
      'Accept': 'application/pdf', // Explicitly request PDF
      'Authorization': `Bearer ${token}`, // Add authentication header
    },
  })
    .then((res) => {
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers.get('content-type'));
      
      // Check if response is successful
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      // Verify it's actually a PDF
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('Response is not a PDF file');
      }
      
      return res.blob();
    })
    .then((blob) => {
      console.log('PDF blob size:', blob.size);
      
      // Check if blob is empty
      if (blob.size === 0) {
        throw new Error('Received empty PDF file');
      }
      
      // Create URL and open PDF
      const pdfUrl = URL.createObjectURL(blob);
      const newWindow = window.open(pdfUrl);
      
      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback: trigger download instead
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `ClaimBill_${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('PDF downloaded successfully!');
      }

      // Clean up the URL after a reasonable time
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 5000); // Increased timeout to 5 seconds
    })
    .catch((err) => {
      console.error("Error fetching PDF:", err.message);
      console.error("Full error:", err);
      
      // More specific error messages
      if (err.message.includes('Failed to fetch')) {
        alert('Network error: Please check your internet connection and try again.');
      } else if (err.message.includes('404')) {
        alert('PDF not found: The requested document may not exist.');
      } else if (err.message.includes('500')) {
        alert('Server error: Please try again later or contact support.');
      } else {
        alert(`Failed to load PDF: ${err.message}`);
      }
    });

  }

  /*function handleViewFinalBudget(id) {

    fetch(`http://localhost:5050/api/coordinator/event/claimPdf/${id}`, {
      method: "GET",
    })
      .then((res) => {
        // Check if response is successful
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.blob();
      })
      .then((blob) => {
        // Use 'blob' instead of 'data'
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl);

        // Optional: Clean up the URL after some time to free memory
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 1000);
      })
      .catch((err) => {
        console.error("Error fetching PDF:", err.message);
        alert("Failed to load PDF. Please try again.");
      });
  } */

  const handleApplyClaim = (programme) => {
    console.log('=== Apply Claim Debug ===');
    console.log('Programme:', programme);
    console.log('Programme budgetBreakdown:', programme.budgetBreakdown);
    console.log('Programme budgetBreakdown.expenses:', programme.budgetBreakdown?.expenses);
    console.log('Programme claimBill:', programme.claimBill);
    
    setSelectedProgramme(programme);
    
    // Check if there are existing claim bill expenses, otherwise use budget breakdown expenses
    let expensesToUse = [];
    
    if (programme.claimBill && programme.claimBill.expenses && programme.claimBill.expenses.length > 0) {
      // If claim bill already exists, use those expenses for editing
      expensesToUse = programme.claimBill.expenses.map(expense => ({
        category: expense.category || '',
        amount: expense.amount || ''
      }));
      console.log('Using existing claim bill expenses:', expensesToUse);
    } else if (programme.budgetBreakdown && programme.budgetBreakdown.expenses && programme.budgetBreakdown.expenses.length > 0) {
      // Use original budget breakdown expenses as starting point
      expensesToUse = programme.budgetBreakdown.expenses.map(expense => ({
        category: expense.category || '',
        amount: expense.amount || ''
      }));
      console.log('Using budget breakdown expenses:', expensesToUse);
    } else {
      // Default to one empty expense row
      expensesToUse = [{ category: "", amount: "" }];
      console.log('Using default empty expense');
    }
    
    console.log('Final expenses to use:', expensesToUse);
    setClaimData(expensesToUse);
    setOpenClaimDialog(true);
  };

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

  const handleSubmitClaim = async () => {
    console.log(claimData);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5050/api/coordinator/claims/${selectedProgramme._id}`,
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
          const response = await axios.get("http://localhost:5050/api/coordinator/programmes", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setEvents(Array.isArray(response.data) ? response.data : []);
          console.log("Events refreshed after claim submission");
        } catch (error) {
          console.error("Failed to refresh events after claim submission:", error);
        }
      }, 1000); // Wait 1 second to allow server processing
      
      // Clear the claim data form - reset to default
      setClaimData([{ category: "", amount: "" }]);
      setSelectedProgramme(null);
    } catch (error) {
      console.error("Claim submission error:", error);
      enqueueSnackbar("Failed to submit claim bill", { variant: "error" });
    }
  };
  const steps = [
    "Basic Details",
    "Coordinators",
    "Participants",
    "Registration",
    "Financials",
    "Review",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5050/api/coordinator/programmes",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEvents(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError(err.message);
        enqueueSnackbar("Failed to load events", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    getCurrentHod();
  }, [user]);
  const incomeArr = formData.budgetBreakdown.income;
  const calculateFinancials = () => {
    const incomeArr = Array.isArray(formData.budgetBreakdown?.income)
      ? formData.budgetBreakdown.income
      : [];

    const updatedIncome = incomeArr.map((i) => {
      const ep = Number(i.expectedParticipants || 0);
      const ppa = Number(i.perParticipantAmount || 0);
      const gst = Number(i.gstPercentage || 0);
      const inc = ep * ppa * (1 - gst / 100);
      return { ...i, income: inc };
    });

    const totalIncome = updatedIncome.reduce((sum, i) => sum + i.income, 0);
    const expenses = Array.isArray(formData.budgetBreakdown?.expenses)
      ? formData.budgetBreakdown.expenses
      : [];
    const totalExpenditure = expenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );
    const universityOverhead = totalIncome * 0.3;

    setFormData((prev) => ({
      ...prev,
      budgetBreakdown: {
        ...prev.budgetBreakdown,
        income: updatedIncome,
        totalIncome,
        totalExpenditure,
        universityOverhead,
      },
    }));
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      calculateFinancials();
    }, 300); // Delay to prevent rapid recalculations

    return () => clearTimeout(timeout); // Cleanup on unmount or change
  }, [formData.budgetBreakdown.income, formData.budgetBreakdown.expenses]);

  const handleEdit = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5050/api/coordinator/programmes/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;

      setFormData({
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      });

      // Clear input fields
      setNewTargetAudience("");
      setNewResourcePerson("");

      setEditId(id);
      setOpenForm(true);
      setActiveStep(0);
    } catch (error) {
      console.error("❌ Error loading programme for editing:", error);
      enqueueSnackbar("Failed to load programme details", { variant: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note order?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5050/api/coordinator/programmes/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      enqueueSnackbar("Note Order deleted successfully", {
        variant: "success",
      });
      await fetchEvents(); // refresh list
    } catch (error) {
      console.error("❌ Error deleting programme:", error);
      enqueueSnackbar("Failed to delete Note Order", { variant: "error" });
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5050/api/coordinator/programmes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Ensure we always set an array, even if response.data is null/undefined
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents([]); // Fallback to empty array on error
      enqueueSnackbar("Failed to load events", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleNestedChange = (section, field, value, index = null) => {
    setFormData((prev) => {
      const updated = { ...prev };

      if (section.includes(".")) {
        const [parent, child] = section.split(".");

        // Ensure parent exists
        if (!updated[parent]) updated[parent] = {};

        // If child should be an array (e.g., budgetBreakdown.income or expenses)
        if (!updated[parent][child]) {
          updated[parent][child] = Array.isArray(prev[parent]?.[child])
            ? []
            : {};
        }

        // If it's an array (e.g., income, expenses)
        if (Array.isArray(updated[parent][child]) && index !== null) {
          updated[parent][child][index] = {
            ...updated[parent][child][index],
            [field]: value,
          };
        } else {
          // Object case
          updated[parent][child] = {
            ...updated[parent][child],
            [field]: value,
          };
        }
      }

      // Top-level array (e.g., coordinators)
      else if (Array.isArray(updated[section]) && index !== null) {
        updated[section][index] = {
          ...updated[section][index],
          [field]: value,
        };
      }

      // Fallback: nested object
      else {
        if (!updated[section]) updated[section] = {};
        updated[section][field] = value;
      }

      return updated;
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, brochure: e.target.files[0] });
  };

  const handleAddCoordinator = () => {
    setFormData({
      ...formData,
      coordinators: [
        ...formData.coordinators,
        { name: "", designation: "", department: "" },
      ],
    });
  };

  const handleRemoveCoordinator = (index) => {
    const updated = formData.coordinators.filter((_, i) => i !== index);
    setFormData({ ...formData, coordinators: updated });
  };

  // Helper functions for managing associative departments
  const handleAddAssociativeDepartment = () => {
    setFormData({
      ...formData,
      organizingDepartments: {
        ...formData.organizingDepartments,
        associative: [...formData.organizingDepartments.associative, ""]
      }
    });
  };

  const handleRemoveAssociativeDepartment = (index) => {
    const updated = formData.organizingDepartments.associative.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      organizingDepartments: {
        ...formData.organizingDepartments,
        associative: updated
      }
    });
    
    // Also remove the corresponding department approver if it exists
    const deptToRemove = formData.organizingDepartments.associative[index];
    const updatedApprovers = formData.departmentApprovers.filter(
      (approver) => getDeptAbbreviation(approver.department) !== getDeptAbbreviation(deptToRemove)
    );
    setFormData(prev => ({
      ...prev,
      departmentApprovers: updatedApprovers
    }));
  };

  const handleAssociativeDepartmentChange = (index, value) => {
    const updated = [...formData.organizingDepartments.associative];
    const oldValue = updated[index];
    updated[index] = value;
    
    setFormData({
      ...formData,
      organizingDepartments: {
        ...formData.organizingDepartments,
        associative: updated
      }
    });

    // Remove old department approver if it exists
    if (oldValue) {
      const filteredApprovers = formData.departmentApprovers.filter(
        (approver) => !getDeptAbbreviation(approver.department).includes(getDeptAbbreviation(oldValue))
      );
      setFormData(prev => ({
        ...prev,
        departmentApprovers: filteredApprovers
      }));
    }

    // Add department approver if the department name is provided and doesn't already exist
    if (value.trim()) {
      const departmentAbbrev = getDeptAbbreviation(value);
      const exists = formData.departmentApprovers.find(approver => 
        getDeptAbbreviation(approver.department) === departmentAbbrev
      );
      
      if (!exists) {
        const newApprover = {
          department: departmentAbbrev,
          hodName: "",
          hodDesignation: `HoD, ${departmentAbbrev}`,
          approved: false,
          approvedDate: null,
          signature: ""
        };
        setFormData(prev => ({
          ...prev,
          departmentApprovers: [...prev.departmentApprovers, newApprover]
        }));
      }
    }
  };

  // Helper function to get department abbreviation
  const getDeptAbbreviation = (deptName) => {
    if (!deptName) return "";
    const name = deptName.toUpperCase();
    if (name.includes("ELECTRICAL") && name.includes("ELECTRONICS")) return "EEE";
    if (name.includes("CYBER SECURITY")) return "CCS";
    if (name.includes("INFORMATION TECHNOLOGY")) return "IT";
    if (name.includes("ELECTRONICS") && name.includes("COMMUNICATION")) return "ECE";
    if (name.includes("MECHANICAL")) return "MECH";
    if (name.includes("CIVIL")) return "CIVIL";
    if (name.includes("COMPUTER SCIENCE")) return "DCSE";
    // For simple cases like "EEE", "ECE", etc.
    if (name === "EEE" || name === "ECE" || name === "IT" || name === "MECH" || name === "CIVIL" || name === "CCS") {
      return name;
    }
    // Extract capital letters as fallback
    return name.replace(/[^A-Z]/g, '') || name;
  };

  const handleRemoveIncome = (index) => {
    setFormData((prev) => ({
      ...prev,
      budgetBreakdown: {
        ...prev.budgetBreakdown,
        income: prev.budgetBreakdown.income.filter((_, i) => i !== index),
      },
    }));
  };

  const handleRemoveExpense = (index) => {
    setFormData((prev) => ({
      ...prev,
      budgetBreakdown: {
        ...prev.budgetBreakdown,
        expenses: prev.budgetBreakdown.expenses.filter((_, i) => i !== index),
      },
    }));
  };

  const handleAddIncomeCategory = () => {
    setFormData((prev) => ({
      ...prev,
      budgetBreakdown: {
        ...prev.budgetBreakdown,
        income: [
          ...prev.budgetBreakdown.income,
          {
            category: "",
            expectedParticipants: "",
            perParticipantAmount: "",
            gstPercentage: "",
            income: 0,
          },
        ],
      },
    }));
  };

  const handleAddExpense = () => {
    setFormData((prev) => ({
      ...prev,
      budgetBreakdown: {
        ...prev.budgetBreakdown,
        expenses: [
          ...prev.budgetBreakdown.expenses,
          { category: "", amount: "" },
        ],
      },
    }));
  };

  const handleAddApprover = () => {
    setFormData((prev) => ({
      ...prev,
      approvers: [...prev.approvers, { name: "", role: "" }],
    }));
  };

  // In your Dashboard.js component
  const handleGeneratePDF = async (programmeId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/coordinator/programmes/${programmeId}/pdf`,
        {
          responseType: "blob", // Important for file downloads
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Create a blob URL for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Programme_${programmeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error generating PDF:", error);
      enqueueSnackbar("Failed to generate PDF", { variant: "error" });
    }
  };

  // Generate professional styled brochure
  const handleGenerateBrochure = async (eventData) => {
    try {
      console.log("Generating styled brochure for event:", eventData.title);
      
      // Fetch event data with organizing committee from HOD API
      let eventWithOrganizingCommittee;
      try {
        const response = await axios.get(`http://localhost:5050/api/hod/events/${eventData._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        eventWithOrganizingCommittee = response.data;
        console.log("Event data fetched from HOD API with organizing committee");
      } catch (hodApiError) {
        console.warn("Failed to fetch from HOD API, using coordinator event data:", hodApiError.message);
        eventWithOrganizingCommittee = eventData;
      }
      
      // Import the brochure generator dynamically
      const { generateEventBrochure } = await import('../../services/brochureGenerator');
      
      // Generate the professional styled brochure
      const doc = await generateEventBrochure(eventWithOrganizingCommittee);
      
      // Convert to blob and download
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(pdfUrl);
      
      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback: trigger download instead
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${eventData.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'event'}_brochure.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        enqueueSnackbar('Professional brochure downloaded successfully!', { variant: 'success' });
      }

      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 5000);
      
      // Also try to save to backend
      try {
        const formData = new FormData();
        formData.append('brochurePDF', pdfBlob, `Brochure_${eventData.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'event'}.pdf`);
        
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:5050/api/coordinator/brochures/${eventData._id}/save`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData
        });
        console.log("Brochure saved to backend successfully");
      } catch (saveError) {
        console.warn("Failed to save brochure to backend:", saveError.message);
      }
      
    } catch (error) {
      console.error("Error generating brochure:", error.message);
      enqueueSnackbar(`Failed to generate brochure: ${error.message}`, { variant: 'error' });
    }
  };

  const validateCurrentStep = () => {
    switch (activeStep) {
      case 0: // Basic Details
        return !!(
          formData.title &&
          formData.startDate &&
          formData.endDate &&
          formData.venue &&
          formData.duration &&
          formData.type
        );
      case 1: // Coordinators
        return formData.coordinators.every(
          (c) => c.name && c.designation && c.department
        );
      case 2: // Participants
        return formData.targetAudience.length > 0;
      case 3: // Registration (optional step, always valid)
        return true;
      case 4: // Financials
        return (
          formData.budgetBreakdown.income.length > 0 &&
          formData.budgetBreakdown.expenses.length > 0
        );
      case 5: // Review
        return validateForm();
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const validateBudget = () => {
    const { income, expenses } = formData.budgetBreakdown;
    return (
      Number(income.expectedParticipants) > 0 &&
      Number(income.perParticipantAmount) > 0 &&
      expenses.every((exp) => exp.category && Number(exp.amount) > 0)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    console.log("✅ Submit clicked");

    if (submitting) {
      console.log("⚠️ Already submitting, ignoring duplicate submission");
      return;
    }
    setSubmitting(true);

    try {
      console.log("🔍 Validating form...");
      const isValid = validateForm();
      if (!isValid) {
        enqueueSnackbar("Please fill all required fields correctly", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return;
      }

      // Date validation
      if (!formData.startDate || isNaN(new Date(formData.startDate))) {
        throw new Error("Start Date is missing or invalid");
      }
      if (!formData.endDate || isNaN(new Date(formData.endDate))) {
        throw new Error("End Date is missing or invalid");
      }

      // Auth token check
      console.log("🔑 Checking token...");
      const token = localStorage.getItem("token");
      if (!token) {
        enqueueSnackbar("Session expired. Please login again.", {
          variant: "error",
          persist: true,
        });
        setSubmitting(false);
        return;
      }

      // Build FormData
      console.log("📦 Building FormData...");
      const formPayload = new FormData();

      formPayload.append("title", formData.title.trim());
      formPayload.append(
        "startDate",
        new Date(formData.startDate).toISOString()
      );
      formPayload.append("endDate", new Date(formData.endDate).toISOString());
      formPayload.append("venue", formData.venue.trim());
      formPayload.append("mode", formData.mode);
      formPayload.append("duration", formData.duration.trim());
      formPayload.append("type", formData.type.trim());
      formPayload.append("objectives", formData.objectives.trim());
      formPayload.append("outcomes", formData.outcomes.trim());
      formPayload.append(
        "budget",
        formData.budget ? formData.budget.toString() : "0"
      );

      formPayload.append("createdBy", user._id);
      formPayload.append("reviewedBy", hod._id);

      // Append JSON fields safely
      formPayload.append(
        "coordinators",
        JSON.stringify(formData.coordinators || [])
      );
      formPayload.append(
        "targetAudience",
        JSON.stringify(formData.targetAudience || [])
      );
      formPayload.append(
        "resourcePersons",
        JSON.stringify(formData.resourcePersons || [])
      );

      // Add registration procedure data
      formPayload.append(
        "registrationProcedure",
        JSON.stringify(formData.registrationProcedure)
      );

      formPayload.append("approvers", JSON.stringify(formData.approvers || []));

      // Add organizing departments and department approvers
      formPayload.append(
        "organizingDepartments",
        JSON.stringify(formData.organizingDepartments || {
          primary: "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)",
          associative: []
        })
      );
      formPayload.append(
        "departmentApprovers",
        JSON.stringify(formData.departmentApprovers || [])
      );

      formPayload.append(
        "budgetBreakdown",
        JSON.stringify({
          income: formData.budgetBreakdown?.income || [],
          expenses: formData.budgetBreakdown?.expenses || [],
          totalIncome: formData.budgetBreakdown?.totalIncome || 0,
          totalExpenditure: formData.budgetBreakdown?.totalExpenditure || 0,
          universityOverhead: formData.budgetBreakdown?.universityOverhead || 0,
        })
      );

      // Add registration procedure data with proper date handling
      const registrationProcedureData = formData.registrationProcedure || {
        enabled: false,
        instructions: "",
        submissionMethod: "email",
        deadline: null,
        participantLimit: "",
        selectionCriteria: "first come first served basis",
        confirmationDate: null,
        confirmationMethod: "email",
        certificateRequirements: {
          enabled: false,
          attendanceRequired: true,
          evaluation: {
            quiz: { enabled: false, percentage: 0 },
            assignment: { enabled: false, percentage: 0 },
            labWork: { enabled: false, percentage: 0 },
            finalTest: { enabled: false, percentage: 0 }
          }
        },
        additionalNotes: "",
        paymentDetails: {
          enabled: false
        },
        registrationForm: {
          enabled: false
        }
      };

      // Convert dates to ISO strings to ensure proper JSON serialization
      if (registrationProcedureData.deadline && registrationProcedureData.deadline instanceof Date) {
        registrationProcedureData.deadline = registrationProcedureData.deadline.toISOString();
      }
      if (registrationProcedureData.confirmationDate && registrationProcedureData.confirmationDate instanceof Date) {
        registrationProcedureData.confirmationDate = registrationProcedureData.confirmationDate.toISOString();
      }

      console.log("Sending registrationProcedure:", registrationProcedureData);
      
      formPayload.append(
        "registrationProcedure",
        JSON.stringify(registrationProcedureData)
      );

      if (formData.brochure instanceof File) {
        if (formData.brochure.size > 10 * 1024 * 1024) {
          throw new Error("File size exceeds 10MB limit");
        }
        formPayload.append("brochure", formData.brochure);
      }

      console.log("📤 Sending to backend...");
      console.log(formData);
      if (editId) {
        await axios.put(
          `http://localhost:5050/api/coordinator/programmes/${editId}`,
          formPayload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        enqueueSnackbar("Note Order updated successfully!", {
          variant: "success",
        });
      } else {
        await axios.post(
          "http://localhost:5050/api/coordinator/programmes",
          formPayload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        enqueueSnackbar("Note Order created successfully!", {
          variant: "success",
        });
      }

      // ✅ Final common steps after create/edit
      await fetchEvents(); // Refresh list immediately
      setOpenForm(false); // Close dialog
      setEditId(null); // Clear edit mode
      resetForm(); // Clear form state
      setActiveStep(0); // Reset stepper

      console.log("✅ Dialog closed and form reset");
    } catch (error) {
      console.error("❌ Submission error:", error);

      if (error.response) {
        const serverData = error.response.data;
        const message =
          serverData.message ||
          (typeof serverData === "string"
            ? serverData
            : serverData.errors
            ? Object.values(serverData.errors).join(", ")
            : "Something went wrong");
        enqueueSnackbar(message, { variant: "error", autoHideDuration: 4000 });
      } else if (error.request) {
        console.error("🕸 No response received.");
        enqueueSnackbar("No response from server. Check your connection.", {
          variant: "error",
          autoHideDuration: 4000,
        });
      } else {
        enqueueSnackbar(`Error: ${error.message}`, {
          variant: "error",
          autoHideDuration: 4000,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to reset form
  const resetForm = () => {
    setFormData(initialFormState);
    setNewTargetAudience("");
    setNewResourcePerson("");
  };
  // Validation function
  const validateForm = () => {
    // 1. Basic required fields
    const requiredFields = {
      title: formData.title,
      startDate: formData.startDate,
      endDate: formData.endDate,
      venue: formData.venue,
      duration: formData.duration,
      type: formData.type,
      objectives: formData.objectives,
      outcomes: formData.outcomes,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }

    // 2. Coordinators validation
    if (!formData.coordinators?.length) {
      console.error("At least one coordinator required");
      return false;
    }
    for (const coord of formData.coordinators) {
      if (
        !coord.name?.trim() ||
        !coord.designation?.trim() ||
        !coord.department?.trim()
      ) {
        console.error("Coordinator missing name, designation or department");
        return false;
      }
    }

    // 3. Target audience validation
    if (!formData.targetAudience?.length) {
      console.error("Target audience required");
      return false;
    }

    // 4. Financials - Income validation
    if (!formData.budgetBreakdown?.income?.length) {
      console.error("At least one income category required");
      return false;
    }
    for (const income of formData.budgetBreakdown.income) {
      if (
        !income.category?.trim() ||
        isNaN(income.expectedParticipants) ||
        isNaN(income.perParticipantAmount) ||
        isNaN(income.gstPercentage)
      ) {
        console.error("Invalid income entry");
        return false;
      }
    }

    // 5. Financials - Expenses validation
    if (!formData.budgetBreakdown?.expenses?.length) {
      console.error("At least one expense category required");
      return false;
    }
    for (const exp of formData.budgetBreakdown.expenses) {
      if (!exp.category?.trim() || isNaN(exp.amount)) {
        console.error("Invalid expense entry");
        return false;
      }
    }

    return true;
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "approved":
        return (
          <Chip
            icon={<CheckCircle />}
            label="Approved"
            color="success"
            size="small"
          />
        );
      case "rejected":
        return (
          <Chip
            icon={<CheckCircle />}
            label="Rejected"
            color="error"
            size="small"
          />
        );
      default:
        return (
          <Chip
            icon={<PendingActions />}
            label="Pending"
            color="warning"
            size="small"
          />
        );
    }
  };

  // Auto-populate coordinator info when user data is available
  useEffect(() => {
    if (user && formData.coordinators[0] && !formData.coordinators[0].name) {
      setFormData(prev => ({
        ...prev,
        coordinators: [
          {
            name: user.name || "",
            designation: user.designation || "",
            department: user.department || "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)"
          },
          ...prev.coordinators.slice(1)
        ]
      }));
    }
  }, [user]);

  // Handle edit mode from navigation
  useEffect(() => {
    if (isEditMode && editingEvent) {
      // Populate form with editing event data
      const populateFormData = () => {
        const eventData = {
          ...initialFormState,
          title: editingEvent.title || "",
          startDate: editingEvent.startDate ? new Date(editingEvent.startDate) : "",
          endDate: editingEvent.endDate ? new Date(editingEvent.endDate) : "",
          venue: editingEvent.venue || "",
          mode: editingEvent.mode || "Online",
          duration: editingEvent.duration || "",
          type: editingEvent.type || "",
          objectives: editingEvent.objectives || "",
          outcomes: editingEvent.outcomes || "",
          budget: editingEvent.budget || "",
          coordinators: editingEvent.coordinators || initialFormState.coordinators,
          targetAudience: editingEvent.targetAudience || [],
          resourcePersons: editingEvent.resourcePersons || [],
          organizingDepartments: editingEvent.organizingDepartments || initialFormState.organizingDepartments,
          departmentApprovers: editingEvent.departmentApprovers || initialFormState.departmentApprovers,
          budgetBreakdown: editingEvent.budgetBreakdown || initialFormState.budgetBreakdown,
          registrationProcedure: {
            enabled: editingEvent.registrationProcedure?.enabled || false,
            instructions: editingEvent.registrationProcedure?.instructions || "",
            submissionMethod: editingEvent.registrationProcedure?.submissionMethod || "email",
            deadline: editingEvent.registrationProcedure?.deadline ? new Date(editingEvent.registrationProcedure.deadline) : "",
            participantLimit: editingEvent.registrationProcedure?.participantLimit || "",
            selectionCriteria: editingEvent.registrationProcedure?.selectionCriteria || "first come first served basis",
            confirmationDate: editingEvent.registrationProcedure?.confirmationDate ? new Date(editingEvent.registrationProcedure.confirmationDate) : "",
            confirmationMethod: editingEvent.registrationProcedure?.confirmationMethod || "email",
            certificateRequirements: editingEvent.registrationProcedure?.certificateRequirements || initialFormState.registrationProcedure.certificateRequirements,
            additionalNotes: editingEvent.registrationProcedure?.additionalNotes || "",
            paymentDetails: {
              enabled: editingEvent.registrationProcedure?.paymentDetails?.enabled || false,
              accountName: editingEvent.registrationProcedure?.paymentDetails?.accountName || "DIRECTOR, CSRC",
              accountNumber: editingEvent.registrationProcedure?.paymentDetails?.accountNumber || "37614464781",
              accountType: editingEvent.registrationProcedure?.paymentDetails?.accountType || "SAVINGS",
              bankBranch: editingEvent.registrationProcedure?.paymentDetails?.bankBranch || "State Bank of India, Anna University",
              ifscCode: editingEvent.registrationProcedure?.paymentDetails?.ifscCode || "SBIN0006463",
              additionalPaymentInfo: editingEvent.registrationProcedure?.paymentDetails?.additionalPaymentInfo || ""
            },
            registrationForm: {
              enabled: editingEvent.registrationProcedure?.registrationForm?.enabled || false,
              fields: editingEvent.registrationProcedure?.registrationForm?.fields || initialFormState.registrationProcedure.registrationForm.fields,
              additionalRequirements: editingEvent.registrationProcedure?.registrationForm?.additionalRequirements || "*Proof has to be submitted with the application",
              customFields: editingEvent.registrationProcedure?.registrationForm?.customFields || []
            }
          }
        };

        setFormData(eventData);
        setEditId(editingEvent._id);
        setView("form");
        setOpenForm(true);
      };

      populateFormData();
      
      // Clear the location state to prevent interference with future navigations
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [isEditMode, editingEvent, navigate, location.pathname]);

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Failed to load dashboard data: {error}
          <Button onClick={() => window.location.reload()} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            px: 3,
            py: 2,
            backgroundColor: "#1976d2", // Standard MUI blue
            borderRadius: 2,
            color: "white",
          }}
        >
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            Coordinator Dashboard
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" color="error" onClick={handleLogOut}>
              Logout
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                resetForm();
                setEditId(null);
                setActiveStep(0);
                setOpenForm(true);
              }}
              sx={{
                backgroundColor: "#fff",
                color: "#1976d2",
                "&:hover": { backgroundColor: "#f0f0f0" },
              }}
            >
              Create Note Order
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          /* Events Grid - PASTE THE PROVIDED CODE HERE */
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event._id || Math.random()}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderLeft: `4px solid ${
                      event.status === "approved"
                        ? "#4caf50"
                        : event.status === "rejected"
                        ? "#f44336"
                        : "#ff9800"
                    }`,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{ fontWeight: 600 }}
                      >
                        {event.title}
                      </Typography>
                      {getStatusChip(event.status)}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1,
                        color: "text.secondary",
                      }}
                    >
                      <EventAvailable fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {new Date(event.startDate).toLocaleDateString()} -{" "}
                        {new Date(event.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1 }}>
                      <Chip
                        label={`${event.mode} • ${event.duration}`}
                        size="small"
                        color="default"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`₹${event.budget}`}
                        size="small"
                        color="primary"
                        icon={<MonetizationOn fontSize="small" />}
                      />
                    </Box>

                    <Typography variant="body2" paragraph>
                      <strong>Venue:</strong> {event.venue}
                    </Typography>

                    {event.coordinators?.length > 0 && (
                      <Typography variant="body2">
                        <strong>Coordinators:</strong>{" "}
                        {event.coordinators.map((c) => c.name).join(", ")}
                      </Typography>
                    )}

                    {/* HOD Comments Display */}
                    {event.reviewComments && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: "grey.100",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "grey.300",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                          HOD Comments:
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                          {event.reviewComments}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/coordinator/event/${event._id}`)}
                      variant="contained"
                      sx={{ mr: 1 }}
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Receipt />}
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");
                          const response = await axios.get(
                            `http://localhost:5050/api/coordinator/programmes/${event._id}/pdf`,
                            {
                              responseType: "blob",
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );
                          const blob = new Blob([response.data], {
                            type: "application/pdf",
                          });
                          const url = window.URL.createObjectURL(blob);
                          window.open(url, "_blank");
                        } catch (error) {
                          console.error(
                            "PDF generation failed:",
                            error.message
                          );
                          enqueueSnackbar(
                            "⚠️ PDF cannot be opened. Backend server is not running.",
                            {
                              variant: "error",
                              autoHideDuration: 4000,
                            }
                          );
                        }
                      }}
                    >
                      PDF
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEdit(event._id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Delete />}
                      color="error"
                      onClick={() => handleDelete(event._id)}
                    >
                      Delete
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      onClick={() => handleApplyClaim(event)}
                    >
                      Apply Claim Bill
                    </Button> 

                    {event.claimBill && (
                        <Button

                          size="small"
                          startIcon={<Receipt />}
                          onClick={async () => {
                            handleViewFinalBudget(event._id);
                            /*
                            try {
                              console.log("download pdf");
                              const response = await axios.get(
                                `http://localhost:5050/api/coordinator/claims/${event._id}/pdf`,
                                { responseType: "blob" }
                              );
                              console.log("response came");
                              const blob = new Blob([response.data], {
                                type: "application/pdf",
                              });
                              const url = window.URL.createObjectURL(blob);
                              window.open(url, "_blank");
                            } catch (error) {
                              console.error(
                                "Claim PDF generation failed:",
                                error.message
                              );
                              enqueueSnackbar(
                                "⚠️ Claim PDF cannot be opened. Backend may be down or claim not submitted.",
                                {
                                  variant: "error",
                                  autoHideDuration: 4000,
                                }
                              );
                            }  */
                          }
                        
                        }
                        >
                          Claim PDF
                        </Button>
                      )}
                      <Button
                        size="small"
                        startIcon={<FileCopy />}
                        onClick={async () => {
                          handleGenerateBrochure(event);
                        }}
                      >
                        Professional Brochure
                      </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Claim Bill Dialog */}
        <Dialog
          open={openClaimDialog}
          onClose={() => setOpenClaimDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Apply Claim Bill</DialogTitle>
          <DialogContent>
            {claimData.map((item, idx) => (
              <Grid
                container
                spacing={2}
                key={idx}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Grid item xs={5}>
                  <TextField
                    label="Category"
                    fullWidth
                    value={item.category}
                    onChange={(e) =>
                      handleClaimChange("category", e.target.value, idx)
                    }
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    label="Amount"
                    type="number"
                    fullWidth
                    value={item.amount}
                    onChange={(e) =>
                      handleClaimChange("amount", e.target.value, idx)
                    }
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClaimExpense(idx)}
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Box mt={2}>
              <Button variant="outlined" onClick={handleAddClaimExpense}>
                Add Expense Category
              </Button>
            </Box>
            <Box mt={4}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Total Expenditure: ₹
                {claimData
                  .reduce((sum, item) => sum + Number(item.amount || 0), 0)
                  .toFixed(2)}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenClaimDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmitClaim}>
              Submit Claim Bill
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openForm}
          onClose={() => setOpenForm(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ borderBottom: "1px solid #eee", py: 2 }}>
            <Typography variant="h6" component="div">
              {editId ? "Edit Note Order" : "Create New Note Order"}
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 2 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ py: 4 }}>
              {activeStep === 0 && (
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    {/* Event Title */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Event Title *"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>

                    {/* Event Type */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Event Type *"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>

                    {/* Venue */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Venue *"
                        name="venue"
                        value={formData.venue}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>

                    {/* Start Date */}
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Start Date *"
                          value={formData.startDate}
                          onChange={(date) =>
                            handleDateChange("startDate", date)
                          }
                          renderInput={(params) => (
                            <TextField {...params} fullWidth required />
                          )}
                        />
                      </LocalizationProvider>
                    </Grid>

                    {/* End Date */}
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="End Date *"
                          value={formData.endDate}
                          onChange={(date) => handleDateChange("endDate", date)}
                          renderInput={(params) => (
                            <TextField {...params} fullWidth required />
                          )}
                        />
                      </LocalizationProvider>
                    </Grid>

                    {/* Mode */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Mode *</InputLabel>
                        <Select
                          name="mode"
                          value={formData.mode}
                          label="Mode *"
                          onChange={handleInputChange}
                        >
                          <MenuItem value="Online">Online</MenuItem>
                          <MenuItem value="Offline">Offline</MenuItem>
                          <MenuItem value="Hybrid">Hybrid</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Duration */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Duration *"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>

                    {/* Budget */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Budget (₹) *"
                        name="budget"
                        type="number"
                        value={formData.budget}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>

                    {/* Objectives */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Objectives *"
                        name="objectives"
                        value={formData.objectives}
                        onChange={handleInputChange}
                        multiline
                        rows={3}
                        required
                      />
                    </Grid>

                    {/* Outcomes */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Expected Outcomes *"
                        name="outcomes"
                        value={formData.outcomes}
                        onChange={handleInputChange}
                        multiline
                        rows={3}
                        required
                      />
                    </Grid>

                    {/* Brochure Upload */}
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<AttachFile />}
                      >
                        Upload Brochure
                        <input
                          type="file"
                          hidden
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx"
                        />
                      </Button>
                      {formData.brochure && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {formData.brochure.name}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              )}

              {activeStep === 1 && (
                <Grid container spacing={3}>
                  {formData.coordinators.map((coordinator, index) => (
                    <React.Fragment key={index}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Coordinator Name *"
                          value={coordinator.name}
                          onChange={(e) =>
                            handleNestedChange(
                              "coordinators",
                              "name",
                              e.target.value,
                              index
                            )
                          }
                          required
                          margin="normal"
                          disabled={index === 0} // First coordinator is auto-filled and disabled
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Designation *"
                          value={coordinator.designation}
                          onChange={(e) =>
                            handleNestedChange(
                              "coordinators",
                              "designation",
                              e.target.value,
                              index
                            )
                          }
                          required
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Department *"
                          value={coordinator.department}
                          onChange={(e) =>
                            handleNestedChange(
                              "coordinators",
                              "department",
                              e.target.value,
                              index
                            )
                          }
                          required
                          margin="normal"
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={1}
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        {index > 0 && (
                          <IconButton
                            onClick={() => handleRemoveCoordinator(index)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Grid>
                    </React.Fragment>
                  ))}
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={handleAddCoordinator}
                    >
                      Add Coordinator
                    </Button>
                  </Grid>

                  {/* Organizing Departments Section */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                      Organizing Departments
                    </Typography>
                  </Grid>

                  {/* Primary Department (Always DCSE) */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Primary Department"
                      value={formData.organizingDepartments.primary}
                      disabled
                      margin="normal"
                      helperText="Primary department is always DCSE"
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    {/* Empty space to balance the row */}
                  </Grid>

                  {/* Associative Departments */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "medium" }}>
                      Associative Departments (Optional)
                    </Typography>
                  </Grid>

                  {formData.organizingDepartments.associative.map((dept, index) => (
                    <React.Fragment key={index}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label={`Associative Department ${index + 1}`}
                          value={dept}
                          onChange={(e) => handleAssociativeDepartmentChange(index, e.target.value)}
                          margin="normal"
                          placeholder="Enter department name (e.g., CENTRE FOR CYBER SECURITY)"
                        />
                      </Grid>
                      <Grid item xs={12} md={7}>
                        {/* Empty space */}
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={1}
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <IconButton
                          onClick={() => handleRemoveAssociativeDepartment(index)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Grid>
                    </React.Fragment>
                  ))}

                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={handleAddAssociativeDepartment}
                    >
                      Add Associative Department
                    </Button>
                  </Grid>


                </Grid>
              )}

              {activeStep === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Target Audience *
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {formData.targetAudience.map((audience, index) => (
                        <Chip
                          key={index}
                          label={audience}
                          onDelete={() => {
                            const newAudience = formData.targetAudience.filter(
                              (_, i) => i !== index
                            );
                            setFormData({
                              ...formData,
                              targetAudience: newAudience,
                            });
                          }}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                      <TextField
                        size="small"
                        label="Add Target Audience"
                        value={newTargetAudience || ""}
                        onChange={(e) => setNewTargetAudience(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && newTargetAudience?.trim()) {
                            setFormData({
                              ...formData,
                              targetAudience: [
                                ...formData.targetAudience,
                                newTargetAudience.trim(),
                              ],
                            });
                            setNewTargetAudience("");
                          }
                        }}
                        sx={{ flexGrow: 1 }}
                        helperText="Press Enter to add or click the button"
                      />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          if (newTargetAudience?.trim()) {
                            setFormData({
                              ...formData,
                              targetAudience: [
                                ...formData.targetAudience,
                                newTargetAudience.trim(),
                              ],
                            });
                            setNewTargetAudience("");
                          }
                        }}
                        disabled={!newTargetAudience?.trim()}
                      >
                        Add
                      </Button>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Examples: UG Students, PG Students, Faculty Members, Research Scholars, Industry Professionals
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Resource Persons
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {formData.resourcePersons.map((person, index) => (
                        <Chip
                          key={index}
                          label={person}
                          onDelete={() => {
                            const newPersons = formData.resourcePersons.filter(
                              (_, i) => i !== index
                            );
                            setFormData({
                              ...formData,
                              resourcePersons: newPersons,
                            });
                          }}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                      <TextField
                        size="small"
                        label="Add Resource Person"
                        value={newResourcePerson || ""}
                        onChange={(e) => setNewResourcePerson(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && newResourcePerson?.trim()) {
                            setFormData({
                              ...formData,
                              resourcePersons: [
                                ...formData.resourcePersons,
                                newResourcePerson.trim(),
                              ],
                            });
                            setNewResourcePerson("");
                          }
                        }}
                        sx={{ flexGrow: 1 }}
                        helperText="Press Enter to add or click the button"
                      />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          if (newResourcePerson?.trim()) {
                            setFormData({
                              ...formData,
                              resourcePersons: [
                                ...formData.resourcePersons,
                                newResourcePerson.trim(),
                              ],
                            });
                            setNewResourcePerson("");
                          }
                        }}
                        disabled={!newResourcePerson?.trim()}
                      >
                        Add
                      </Button>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Examples: Dr. John Smith (IIT Delhi), Prof. Jane Doe (Industry Expert), Mr. Alex Kumar (Google)
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                      Approvers
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                        mt: 1,
                        mb: 2,
                        border:"1px solid rgb(213, 214, 215)"
                      }}
                    >
                      <Typography
                        sx={{
                          p: 1.5,
                        }}
                      >
                        {(hod && `Dr. ${hod.name}`||"name")}
                      </Typography>
                      <Typography
                        sx={{
                          textAlign: "center",
                        }}
                      >
                        {hod && hod.role.toUpperCase() || `HOD`}
                      </Typography>
                    </Box>
                    {formData.approvers.map((approver, idx) => (
                      <Grid
                        container
                        spacing={2}
                        key={idx}
                        sx={{ mt: idx > 0 ? 2 : 0 }}
                      >
                        <Grid item xs={6}>
                          <TextField
                            label="Name"
                            fullWidth
                            value={approver.name}
                            onChange={(e) =>
                              handleNestedChange(
                                "approvers",
                                "name",
                                e.target.value,
                                idx
                              )
                            }
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Role"
                            fullWidth
                            value={approver.role}
                            onChange={(e) =>
                              handleNestedChange(
                                "approvers",
                                "role",
                                e.target.value,
                                idx
                              )
                            }
                          />
                        </Grid>
                      </Grid>
                    ))}
                    <Button
                      onClick={handleAddApprover}
                      sx={{ mt: 2 }}
                      variant="outlined"
                    >
                      Add Approver
                    </Button>
                  </Grid>
                </Grid>
              )}

              {activeStep === 3 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: "primary.main", mb: 3 }}>
                    Registration Procedure (Optional)
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {/* Enable Registration Procedure */}
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.registrationProcedure.enabled}
                            onChange={(e) => setFormData({
                              ...formData,
                              registrationProcedure: {
                                ...formData.registrationProcedure,
                                enabled: e.target.checked
                              }
                            })}
                          />
                        }
                        label="Include registration procedure in brochure"
                      />
                    </Grid>

                    {formData.registrationProcedure.enabled && (
                      <>
                        {/* Registration Instructions */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Registration Instructions"
                            name="registrationInstructions"
                            value={formData.registrationProcedure.instructions}
                            onChange={(e) => setFormData({
                              ...formData,
                              registrationProcedure: {
                                ...formData.registrationProcedure,
                                instructions: e.target.value
                              }
                            })}
                            multiline
                            rows={3}
                            placeholder="e.g., Registration can be done using photo copy of the form..."
                          />
                        </Grid>

                        {/* Submission Method */}
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Submission Method</InputLabel>
                            <Select
                              value={formData.registrationProcedure.submissionMethod}
                              onChange={(e) => setFormData({
                                ...formData,
                                registrationProcedure: {
                                  ...formData.registrationProcedure,
                                  submissionMethod: e.target.value
                                }
                              })}
                            >
                              <MenuItem value="email">Email</MenuItem>
                              <MenuItem value="online">Online Portal</MenuItem>
                              <MenuItem value="physical">Physical Submission</MenuItem>
                              <MenuItem value="other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Registration Deadline */}
                        <Grid item xs={12} md={6}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              label="Registration Deadline"
                              value={formData.registrationProcedure.deadline}
                              onChange={(date) => setFormData({
                                ...formData,
                                registrationProcedure: {
                                  ...formData.registrationProcedure,
                                  deadline: date
                                }
                              })}
                              renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                          </LocalizationProvider>
                        </Grid>

                        {/* Participant Limit */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Participant Limit"
                            name="participantLimit"
                            type="number"
                            value={formData.registrationProcedure.participantLimit}
                            onChange={(e) => setFormData({
                              ...formData,
                              registrationProcedure: {
                                ...formData.registrationProcedure,
                                participantLimit: e.target.value
                              }
                            })}
                            placeholder="e.g., 60"
                          />
                        </Grid>

                        {/* Selection Criteria */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Selection Criteria"
                            name="selectionCriteria"
                            value={formData.registrationProcedure.selectionCriteria}
                            onChange={(e) => setFormData({
                              ...formData,
                              registrationProcedure: {
                                ...formData.registrationProcedure,
                                selectionCriteria: e.target.value
                              }
                            })}
                            placeholder="first come first served basis"
                          />
                        </Grid>

                        {/* Confirmation Date */}
                        <Grid item xs={12} md={6}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              label="Confirmation Date"
                              value={formData.registrationProcedure.confirmationDate}
                              onChange={(date) => setFormData({
                                ...formData,
                                registrationProcedure: {
                                  ...formData.registrationProcedure,
                                  confirmationDate: date
                                }
                              })}
                              renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                          </LocalizationProvider>
                        </Grid>

                        {/* Confirmation Method */}
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Confirmation Method</InputLabel>
                                                       <Select
                              value={formData.registrationProcedure.confirmationMethod}
                              onChange={(e) => setFormData({
                                ...formData,
                                registrationProcedure: {
                                  ...formData.registrationProcedure,
                                  confirmationMethod: e.target.value
                                }
                              })}
                            >
                              <MenuItem value="email">Email</MenuItem>
                              <MenuItem value="phone">Phone</MenuItem>
                              <MenuItem value="website">Website</MenuItem>
                              <MenuItem value="other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Certificate Requirements */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" sx={{ mb: 2 }}>
                            Certificate Requirements
                          </Typography>
                          
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.registrationProcedure.certificateRequirements.enabled}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  registrationProcedure: {
                                    ...formData.registrationProcedure,
                                    certificateRequirements: {
                                      ...formData.registrationProcedure.certificateRequirements,
                                      enabled: e.target.checked
                                    }
                                  }
                                })}
                              />
                            }
                            label="Include certificate requirements in brochure"
                            sx={{ mb: 2 }}
                          />

                          {formData.registrationProcedure.certificateRequirements.enabled && (
                            <Grid container spacing={2}>
                              {/* Attendance Required */}
                              <Grid item xs={12}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={formData.registrationProcedure.certificateRequirements.attendanceRequired}
                                      onChange={(e) => setFormData({
                                        ...formData,
                                        registrationProcedure: {
                                          ...formData.registrationProcedure,
                                          certificateRequirements: {
                                            ...formData.registrationProcedure.certificateRequirements,
                                            attendanceRequired: e.target.checked
                                          }
                                        }
                                      })}
                                    />
                                  }
                                  label="Full attendance required for certificate"
                                />
                              </Grid>

                              {/* Evaluation Methods */}
                              <Grid item xs={12}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  Evaluation Methods:
                                </Typography>
                                
                                {['quiz', 'assignment', 'labWork', 'finalTest'].map((method) => (
                                  <Box key={method} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={formData.registrationProcedure.certificateRequirements.evaluation[method].enabled}
                                          onChange={(e) => setFormData({
                                            ...formData,
                                            registrationProcedure: {
                                              ...formData.registrationProcedure,
                                              certificateRequirements: {
                                                ...formData.registrationProcedure.certificateRequirements,
                                                evaluation: {
                                                  ...formData.registrationProcedure.certificateRequirements.evaluation,
                                                  [method]: {
                                                    ...formData.registrationProcedure.certificateRequirements.evaluation[method],
                                                    enabled: e.target.checked
                                                  }
                                                }
                                              }
                                            }
                                          })}
                                      />}
                                      label={method.charAt(0).toUpperCase() + method.slice(1)}
                                    />
                                    <TextField
                                      size="small"
                                      type="number"
                                      placeholder="0"
                                      value={formData.registrationProcedure.certificateRequirements.evaluation[method].percentage}
                                      onChange={(e) => setFormData({
                                        ...formData,
                                        registrationProcedure: {
                                          ...formData.registrationProcedure,
                                          certificateRequirements: {
                                            ...formData.registrationProcedure.certificateRequirements,
                                            evaluation: {
                                              ...formData.registrationProcedure.certificateRequirements.evaluation,
                                              [method]: {
                                                ...formData.registrationProcedure.certificateRequirements.evaluation[method],
                                                percentage: parseInt(e.target.value) || 0
                                              }
                                            }
                                          }
                                        }
                                      })}
                                      disabled={!formData.registrationProcedure.certificateRequirements.evaluation[method].enabled}
                                      sx={{ width: 80 }}
                                    />
                                    <Typography variant="body2">%</Typography>
                                  </Box>
                                ))}
                              </Grid>
                            </Grid>
                          )}
                        </Grid>

                        {/* Additional Notes */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Additional Notes"
                            name="additionalNotes"
                            value={formData.registrationProcedure.additionalNotes}
                            onChange={(e) => setFormData({
                              ...formData,
                              registrationProcedure: {
                                ...formData.registrationProcedure,
                                additionalNotes: e.target.value
                              }
                            })}
                            multiline
                            rows={2}
                            placeholder="Any additional instructions or requirements..."
                          />
                        </Grid>

                        {/* Payment Details Section */}
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle1" sx={{ mb: 2 }}>
                            Payment Details (Optional)
                          </Typography>
                          
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.registrationProcedure.paymentDetails.enabled}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  registrationProcedure: {
                                    ...formData.registrationProcedure,
                                    paymentDetails: {
                                      ...formData.registrationProcedure.paymentDetails,
                                      enabled: e.target.checked
                                    }
                                  }
                                })}
                              />
                            }
                            label="Include payment details in brochure"
                            sx={{ mb: 2 }}
                          />

                          {formData.registrationProcedure.paymentDetails.enabled && (
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <TextField
                                  fullWidth
                                  label="Account Name"
                                  value={formData.registrationProcedure.paymentDetails.accountName}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    registrationProcedure: {
                                      ...formData.registrationProcedure,
                                      paymentDetails: {
                                        ...formData.registrationProcedure.paymentDetails,
                                        accountName: e.target.value
                                      }
                                    }
                                  })}
                                />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <TextField
                                  fullWidth
                                  label="Account Number"
                                  value={formData.registrationProcedure.paymentDetails.accountNumber}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    registrationProcedure: {
                                      ...formData.registrationProcedure,
                                      paymentDetails: {
                                        ...formData.registrationProcedure.paymentDetails,
                                        accountNumber: e.target.value
                                      }
                                    }
                                  })}
                                />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                  <InputLabel>Account Type</InputLabel>
                                  <Select
                                    value={formData.registrationProcedure.paymentDetails.accountType}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      registrationProcedure: {
                                        ...formData.registrationProcedure,
                                        paymentDetails: {
                                          ...formData.registrationProcedure.paymentDetails,
                                          accountType: e.target.value
                                        }
                                      }
                                    })}
                                  >
                                    <MenuItem value="SAVINGS">Savings</MenuItem>
                                    <MenuItem value="CURRENT">Current</MenuItem>
                                    <MenuItem value="OTHER">Other</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <TextField
                                  fullWidth
                                  label="IFSC Code"
                                  value={formData.registrationProcedure.paymentDetails.ifscCode}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    registrationProcedure: {
                                      ...formData.registrationProcedure,
                                      paymentDetails: {
                                        ...formData.registrationProcedure.paymentDetails,
                                        ifscCode: e.target.value
                                      }
                                    }
                                  })}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Bank & Branch"
                                  value={formData.registrationProcedure.paymentDetails.bankBranch}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    registrationProcedure: {
                                      ...formData.registrationProcedure,
                                      paymentDetails: {
                                        ...formData.registrationProcedure.paymentDetails,
                                        bankBranch: e.target.value
                                      }
                                    }
                                  })}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Additional Payment Information"
                                  value={formData.registrationProcedure.paymentDetails.additionalPaymentInfo}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    registrationProcedure: {
                                      ...formData.registrationProcedure,
                                      paymentDetails: {
                                        ...formData.registrationProcedure.paymentDetails,
                                        additionalPaymentInfo: e.target.value
                                      }
                                    }
                                  })}
                                  multiline
                                  rows={2}
                                  placeholder="Any additional payment instructions..."
                                />
                              </Grid>
                            </Grid>
                          )}
                        </Grid>

                        {/* Registration Form Section */}
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle1" sx={{ mb: 2 }}>
                            Registration Form Template (Optional)
                          </Typography>
                          
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.registrationProcedure.registrationForm.enabled}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  registrationProcedure: {
                                    ...formData.registrationProcedure,
                                    registrationForm: {
                                      ...formData.registrationProcedure.registrationForm,
                                      enabled: e.target.checked
                                    }
                                  }
                                })}
                              />
                            }
                            label="Include registration form template in brochure"
                            sx={{ mb: 2 }}
                          />

                          {formData.registrationProcedure.registrationForm.enabled && (
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                  Select which fields to include in the registration form:
                                </Typography>
                                
                                <Grid container spacing={1}>
                                  {Object.entries(formData.registrationProcedure.registrationForm.fields).map(([fieldKey, fieldValue]) => {
                                    if (fieldKey === 'category') {
                                      return (
                                        <Grid item xs={12} key={fieldKey}>
                                          <FormControlLabel
                                            control={
                                              <Checkbox
                                                checked={fieldValue.enabled}
                                                onChange={(e) => setFormData({
                                                  ...formData,
                                                  registrationProcedure: {
                                                    ...formData.registrationProcedure,
                                                    registrationForm: {
                                                      ...formData.registrationProcedure.registrationForm,
                                                      fields: {
                                                        ...formData.registrationProcedure.registrationForm.fields,
                                                        category: {
                                                          ...formData.registrationProcedure.registrationForm.fields.category,
                                                          enabled: e.target.checked
                                                        }
                                                      }
                                                    }
                                                  }
                                                })}
                                              />
                                            }
                                            label="Category Selection"
                                          />
                                          
                                          {fieldValue.enabled && (
                                            <Box sx={{ ml: 4, mt: 1 }}>
                                              <Typography variant="body2" sx={{ mb: 1 }}>
                                                Category Options:
                                              </Typography>
                                              {fieldValue.options.map((option, index) => (
                                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                  <TextField
                                                    size="small"
                                                    value={option}
                                                    onChange={(e) => {
                                                      const newOptions = [...fieldValue.options];
                                                      newOptions[index] = e.target.value;
                                                      setFormData({
                                                        ...formData,
                                                        registrationProcedure: {
                                                          ...formData.registrationProcedure,
                                                          registrationForm: {
                                                            ...formData.registrationProcedure.registrationForm,
                                                            fields: {
                                                              ...formData.registrationProcedure.registrationForm.fields,
                                                              category: {
                                                                ...formData.registrationProcedure.registrationForm.fields.category,
                                                                options: newOptions
                                                              }
                                                            }
                                                          }
                                                        }
                                                      });
                                                    }}
                                                    sx={{ flexGrow: 1 }}
                                                  />
                                                  <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                      const newOptions = fieldValue.options.filter((_, i) => i !== index);
                                                      setFormData({
                                                        ...formData,
                                                        registrationProcedure: {
                                                          ...formData.registrationProcedure,
                                                          registrationForm: {
                                                            ...formData.registrationProcedure.registrationForm,
                                                            fields: {
                                                              ...formData.registrationProcedure.registrationForm.fields,
                                                              category: {
                                                                ...formData.registrationProcedure.registrationForm.fields.category,
                                                                options: newOptions
                                                              }
                                                            }
                                                          }
                                                        }
                                                      });
                                                    }}
                                                  >
                                                    <Delete />
                                                  </IconButton>
                                                </Box>
                                              ))}
                                              <Button
                                                size="small"
                                                onClick={() => {
                                                  const newOptions = [...fieldValue.options, ""];
                                                  setFormData({
                                                    ...formData,
                                                    registrationProcedure: {
                                                      ...formData.registrationProcedure,
                                                      registrationForm: {
                                                        ...formData.registrationProcedure.registrationForm,
                                                        fields: {
                                                          ...formData.registrationProcedure.registrationForm.fields,
                                                          category: {
                                                            ...formData.registrationProcedure.registrationForm.fields.category,
                                                            options: newOptions
                                                          }
                                                        }
                                                      }
                                                    }
                                                  });
                                                }}
                                              >
                                                Add Option
                                              </Button>
                                            </Box>
                                          )}
                                        </Grid>
                                      );
                                    } else {
                                      const fieldLabel = fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                      return (
                                        <Grid item xs={6} md={3} key={fieldKey}>
                                          <FormControlLabel
                                            control={
                                              <Checkbox
                                                checked={fieldValue}
                                                onChange={(e) => setFormData({
                                                  ...formData,
                                                  registrationProcedure: {
                                                    ...formData.registrationProcedure,
                                                    registrationForm: {
                                                      ...formData.registrationProcedure.registrationForm,
                                                      fields: {
                                                        ...formData.registrationProcedure.registrationForm.fields,
                                                        [fieldKey]: e.target.checked
                                                      }
                                                    }
                                                  }
                                                })}
                                              />
                                            }
                                            label={fieldLabel}
                                          />
                                        </Grid>
                                      );
                                    }
                                  })}
                                </Grid>
                              </Grid>
                              
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Additional Requirements"
                                  value={formData.registrationProcedure.registrationForm.additionalRequirements}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    registrationProcedure: {
                                      ...formData.registrationProcedure,
                                      registrationForm: {
                                        ...formData.registrationProcedure.registrationForm,
                                        additionalRequirements: e.target.value
                                      }
                                    }
                                  })}
                                  placeholder="*Proof has to be submitted with the application"
                                  multiline
                                  rows={2}
                                />
                              </Grid>
                            </Grid>
                          )}
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
              )}

              {activeStep === 4 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                      Budget Breakdown
                    </Typography>

                    <Grid container spacing={2}>
                      {/* INCOME Section */}
                      {/* Income Section */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          Income
                        </Typography>
                      </Grid>

                      {Array.isArray(formData.budgetBreakdown?.income) &&
                        formData.budgetBreakdown.income.map((income, idx) => (
                          <Grid
                            container
                            spacing={2}
                            key={idx}
                            alignItems="center"
                          >
                            <Grid item xs={3}>
                              <TextField
                                label="Category (e.g., Faculty,Participants)"
                                fullWidth
                                value={income.category}
                                onChange={(e) =>
                                  handleNestedChange(
                                    "budgetBreakdown.income",
                                    "category",
                                    e.target.value,
                                    idx
                                  )
                                }
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <TextField
                                label="No. of Participants"
                                type="number"
                                fullWidth
                                value={income.expectedParticipants}
                                onChange={(e) =>
                                  handleNestedChange(
                                    "budgetBreakdown.income",
                                    "expectedParticipants",
                                    e.target.value,
                                    idx
                                  )
                                }
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <TextField
                                label="Amount / Person"
                                type="number"
                                fullWidth
                                value={income.perParticipantAmount}
                                onChange={(e) =>
                                  handleNestedChange(
                                    "budgetBreakdown.income",
                                    "perParticipantAmount",
                                    e.target.value,
                                    idx
                                  )
                                }
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <TextField
                                label="GST %"
                                type="number"
                                fullWidth
                                value={income.gstPercentage}
                                onChange={(e) =>
                                  handleNestedChange(
                                    "budgetBreakdown.income",
                                    "gstPercentage",
                                    e.target.value,
                                    idx
                                  )
                                }
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <TextField
                                label="Income"
                                fullWidth
                                value={Number(income.income || 0).toFixed(2)}
                                InputProps={{ readOnly: true }}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={1}
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <IconButton
                                color="error"
                                onClick={() => handleRemoveIncome(idx)}
                              >
                                <Delete />
                              </IconButton>
                            </Grid>
                          </Grid>
                        ))}

                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={handleAddIncomeCategory}
                        >
                          Add Income Category
                        </Button>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          Expenses
                        </Typography>
                      </Grid>

                      {Array.isArray(formData.budgetBreakdown?.expenses) &&
                        formData.budgetBreakdown.expenses.map((exp, idx) => (
                          <Grid
                            container
                            spacing={2}
                            key={idx}
                            alignItems="center"
                          >
                            <Grid item xs={5}>
                              <TextField
                                label="Category"
                                fullWidth
                                value={exp.category}
                                onChange={(e) =>
                                  handleNestedChange(
                                    "budgetBreakdown.expenses",
                                    "category",
                                    e.target.value,
                                    idx
                                  )
                                }
                              />
                            </Grid>
                            <Grid item xs={5}>
                              <TextField
                                label="Amount (₹)"
                                type="number"
                                fullWidth
                                value={exp.amount}
                                onChange={(e) =>
                                  handleNestedChange(
                                    "budgetBreakdown.expenses",
                                    "amount",
                                    e.target.value,
                                    idx
                                  )
                                }
                              />
                            </Grid>
                            <Grid
                              item
                              xs={2}
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <IconButton
                                color="error"
                                onClick={() => handleRemoveExpense(idx)}
                              >
                                <Delete />
                              </IconButton>
                            </Grid>
                          </Grid>
                        ))}

                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <Button variant="outlined" onClick={handleAddExpense}>
                          Add Expense
                        </Button>
                      </Grid>

                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <Typography>
                          <strong>Total Expenditure:</strong> ₹
                          {Number(
                            formData.budgetBreakdown?.totalExpenditure || 0
                          ).toFixed(2)}
                        </Typography>
                        <Typography>
                          <strong>University Overhead (30%):</strong> ₹
                          {Number(
                            formData.budgetBreakdown?.universityOverhead || 0
                          ).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {activeStep === 5 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Review Your Note Order
                  </Typography>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Event Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                          <strong>Title:</strong> {formData.title}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Type:</strong> {formData.type}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Venue:</strong> {formData.venue}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                          <strong>Dates:</strong>{" "}
                          {formData.startDate?.toLocaleDateString()} to{" "}
                          {formData.endDate?.toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Mode:</strong> {formData.mode}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Duration:</strong> {formData.duration}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Coordinators
                    </Typography>
                    {formData.coordinators.map((coord, index) => (
                      <Typography key={index} variant="body2">
                        {coord.name} ({coord.designation}, {coord.department})
                      </Typography>
                    ))}
                  </Paper>

                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Financial Details
                    </Typography>

                    <Typography variant="body2">
                      <strong>Budget:</strong> ₹{formData.budget}
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Income Categories:</strong>
                    </Typography>
                    {Array.isArray(formData.budgetBreakdown.income) &&
                    formData.budgetBreakdown.income.length > 0 ? (
                      formData.budgetBreakdown.income.map((inc, index) => (
                        <Typography variant="body2" key={index}>
                          • {inc.category}: ₹{inc.income?.toFixed(2)}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2">
                        No income categories added.
                      </Typography>
                    )}

                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Total Income:</strong> ₹
                      {formData.budgetBreakdown.totalIncome?.toFixed(2) || 0}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Total Expenditure:</strong> ₹
                      {formData.budgetBreakdown.totalExpenditure?.toFixed(2) ||
                        0}
                    </Typography>

                    <Typography variant="body2">
                      <strong>University Overhead (30%):</strong> ₹
                      {formData.budgetBreakdown.universityOverhead?.toFixed(
                        2
                      ) || 0}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ borderTop: "1px solid #eee", px: 3, py: 2 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box sx={{ flex: "1 1 auto" }} />

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!validateForm()}
                  sx={{
                    minWidth: 150,
                    bgcolor: "#1976d2",
                    "&:hover": { bgcolor: "#1565c0" },
                    "&:disabled": { bgcolor: "#e0e0e0" },
                  }}
                >
                  {submitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    editId ? "Update Note Order" : "Submit Note Order"
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!validateCurrentStep()}
                  sx={{
                    minWidth: 100,
                    bgcolor: "#1976d2",
                    "&:hover": { bgcolor: "#1565c0" },
                    "&:disabled": { bgcolor: "#e0e0e0" },
                  }}
                >
                  Next
                </Button>
              )}
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default CoordinatorDashboard;
