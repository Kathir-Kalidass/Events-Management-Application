import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const initialFormState = {
    title: "",
    startDate: null,
    endDate: null,
    venue: "",
    mode: "Online",
    duration: "",
    type: "",
    objectives: "",
    outcomes: "",
    budget: "",
    brochure: null,
    coordinators: [{ name: "", designation: "", department: "" }],
    targetAudience: [],
    resourcePersons: [],

    approvers: [{ name: "", role: "" }],

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
        authorization: `Bearer ${token}`,
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

  const handleApplyClaim = (programme) => {
    setSelectedProgramme(programme);
    setClaimData(programme.budgetBreakdown.expenses);
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
      await axios.post(
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
      enqueueSnackbar("Claim Bill submitted successfully!", {
        variant: "success",
      });
      setOpenClaimDialog(false);
    } catch (error) {
      enqueueSnackbar("Failed to submit claim bill", { variant: "error" });
    }
  };
  const steps = [
    "Basic Details",
    "Coordinators",
    "Participants",
    "Financials",
    "Review",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5050/api/coordinator/programmes"
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
      case 3: // Financials
        return (
          formData.budgetBreakdown.income.length > 0 &&
          formData.budgetBreakdown.expenses.length > 0
        );
      case 4: // Review
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
    console.log("✅ Submit clicked");
    console.log();

    if (submitting) return;
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

      formPayload.append("approvers", JSON.stringify(formData.approvers || []));

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
                  </CardContent>

                  <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
                    <Button
                      size="small"
                      startIcon={<Receipt />}
                      onClick={async () => {
                        try {
                          const response = await axios.get(
                            `http://localhost:5050/api/coordinator/programmes/${event._id}/pdf`,
                            {
                              responseType: "blob",
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
                    {event.claimBill &&
                      event.claimBill.expenses?.length > 0 && (
                        <Button
                          
                          size="small"
                          startIcon={<Receipt />}
                          onClick={async () => {
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
                            }
                          }}
                        >
                          Claim PDF
                        </Button>
                      )}
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
              Create New Note Order
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
                </Grid>
              )}

              {activeStep === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Target Audience (comma separated) *"
                      value={
                        Array.isArray(formData.targetAudience)
                          ? formData.targetAudience.join(", ")
                          : ""
                      }
                      onChange={(e) => {
                        const values = e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter((s) => s !== "");
                        setFormData({
                          ...formData,
                          targetAudience: values,
                        });
                      }}
                      required
                      margin="normal"
                      multiline
                      rows={2}
                      helperText="Enter comma-separated values (e.g., Students, Faculty, Researchers)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Resource Persons (comma separated)"
                      value={
                        Array.isArray(formData.resourcePersons)
                          ? formData.resourcePersons.join(", ")
                          : ""
                      }
                      onChange={(e) => {
                        const values = e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setFormData({ ...formData, resourcePersons: values });
                      }}
                      margin="normal"
                      multiline
                      rows={2}
                    />
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
                                label="Category"
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
                                label="Participants"
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
                        <Typography sx={{ mt: 2 }}>
                          <strong>Total Income:</strong> ₹
                          {Number(
                            formData.budgetBreakdown?.totalIncome || 0
                          ).toFixed(2)}
                        </Typography>
                      </Grid>

                      {/* Expenses Section */}
                      <Grid item xs={12} sx={{ mt: 4 }}>
                        <Typography variant="h6">Expenses</Typography>
                      </Grid>

                      {Array.isArray(formData.budgetBreakdown.expenses) &&
                        formData.budgetBreakdown.expenses.map((exp, idx) => (
                          <Grid
                            container
                            spacing={2}
                            key={idx}
                            alignItems="center"
                          >
                            <Grid item xs={5}>
                              <TextField
                                label="Expense Category"
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

              {activeStep === 4 && (
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
                  variant="contained"
                  onClick={handleSubmit}
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
                    "Submit Note Order"
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
