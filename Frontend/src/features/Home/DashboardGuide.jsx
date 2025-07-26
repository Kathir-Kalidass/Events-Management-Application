import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Paper,
  Grid,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Business,
  People,
  Group,
  Security,
  ExpandMore,
  CheckCircle,
  PlayArrow,
  Info,
  Warning,
  Lightbulb,
  Close,
  Dashboard,
  Event,
  Assignment,
  Assessment,
  CardMembership,
  Feedback,
  Person,
  Notifications,
  Settings,
  Schedule,
  AttachMoney,
  Description,
  CloudDownload,
  Share,
  Print,
  Visibility,
  Edit,
  Delete,
  Add,
  Search,
  FilterList,
  GetApp
} from '@mui/icons-material';

const DashboardGuide = ({ open, onClose }) => {
  const [selectedRole, setSelectedRole] = useState(0);
  const theme = useTheme();

  const roles = [
    {
      name: 'HOD (Head of Department)',
      icon: <Business />,
      color: '#1976d2',
      description: 'Complete guide for department heads to manage events and coordinators'
    },
    {
      name: 'Event Coordinator',
      icon: <People />,
      color: '#4caf50',
      description: 'Step-by-step instructions for creating and managing events'
    },
    {
      name: 'Participant',
      icon: <Group />,
      color: '#ff9800',
      description: 'How to browse, register, and participate in events'
    },
    {
      name: 'System Admin',
      icon: <Security />,
      color: '#9c27b0',
      description: 'Administrative functions and system management'
    }
  ];

  const hodGuide = {
    overview: {
      title: "HOD Dashboard Overview",
      description: "Your central hub for managing departmental events, coordinators, and approvals.",
      features: [
        { icon: <Dashboard />, title: "Overview", desc: "Real-time statistics and pending tasks" },
        { icon: <Assignment />, title: "Proposals", desc: "Review and approve event proposals" },
        { icon: <Event />, title: "Approved Events", desc: "Monitor ongoing and completed events" },
        { icon: <AttachMoney />, title: "Finance", desc: "Budget management and financial oversight" },
        { icon: <People />, title: "Committee Management", desc: "Manage convenors and committees" },
        { icon: <Settings />, title: "Signature Management", desc: "Digital signature configuration" }
      ]
    },
    workflows: [
      {
        title: "Event Approval Workflow",
        steps: [
          {
            label: "Review Proposal",
            description: "Navigate to 'Pending Proposals' to see new event submissions",
            actions: ["Click on proposal to view details", "Review event information, budget, and timeline", "Check resource requirements and availability"]
          },
          {
            label: "Approve or Reject",
            description: "Make decision based on departmental policies and resources",
            actions: ["Click 'Approve' to accept the proposal", "Add comments if rejecting", "Set approval conditions if needed"]
          },
          {
            label: "Monitor Progress",
            description: "Track approved events through their lifecycle",
            actions: ["View event status in 'Approved Events'", "Monitor participant registrations", "Review coordinator updates"]
          }
        ]
      },
      {
        title: "Budget Management",
        steps: [
          {
            label: "Review Budget Requests",
            description: "Examine financial requirements for events",
            actions: ["Go to 'Finance' section", "Review proposed budgets", "Check against departmental allocation"]
          },
          {
            label: "Approve Finances",
            description: "Authorize budget allocation for approved events",
            actions: ["Set approved budget amounts", "Add financial conditions", "Monitor expense claims"]
          },
          {
            label: "Track Expenses",
            description: "Monitor actual spending against approved budgets",
            actions: ["Review claim bills", "Approve reimbursements", "Generate financial reports"]
          }
        ]
      }
    ],
    tips: [
      "Use the refresh button to get real-time updates on proposals and events",
      "Set up email notifications for urgent approvals",
      "Regularly review the overview dashboard for pending tasks",
      "Use the calendar view to avoid scheduling conflicts",
      "Maintain clear approval criteria for consistent decisions"
    ]
  };

  const coordinatorGuide = {
    overview: {
      title: "Coordinator Dashboard Overview",
      description: "Your workspace for creating, managing, and executing successful events.",
      features: [
        { icon: <Add />, title: "Create Event", desc: "Design and submit new event proposals" },
        { icon: <Event />, title: "My Events", desc: "Manage your created events" },
        { icon: <People />, title: "Participants", desc: "Handle registrations and attendance" },
        { icon: <CardMembership />, title: "Certificates", desc: "Generate and distribute certificates" },
        { icon: <Assessment />, title: "Reports", desc: "Event analytics and performance metrics" },
        { icon: <AttachMoney />, title: "Claims", desc: "Submit expense claims and reimbursements" }
      ]
    },
    workflows: [
      {
        title: "Creating a New Event",
        steps: [
          {
            label: "Event Details",
            description: "Fill in basic event information",
            actions: ["Enter event title and description", "Set event type and category", "Define target audience", "Add event objectives"]
          },
          {
            label: "Schedule & Venue",
            description: "Configure timing and location details",
            actions: ["Set start and end dates/times", "Choose venue or set as online", "Add session details", "Configure registration deadlines"]
          },
          {
            label: "Resources & Budget",
            description: "Define resource requirements and financial needs",
            actions: ["Add resource persons/speakers", "Set budget requirements", "List required materials", "Define technical needs"]
          },
          {
            label: "Submit for Approval",
            description: "Send proposal to HOD for review",
            actions: ["Review all details", "Submit proposal", "Track approval status", "Respond to HOD feedback"]
          }
        ]
      },
      {
        title: "Managing Event Registrations",
        steps: [
          {
            label: "Monitor Registrations",
            description: "Track participant sign-ups and manage capacity",
            actions: ["View registration dashboard", "Check participant details", "Monitor capacity limits", "Send confirmation emails"]
          },
          {
            label: "Manage Attendance",
            description: "Record participant attendance during events",
            actions: ["Mark attendance for sessions", "Update participant status", "Handle late registrations", "Manage waitlists"]
          },
          {
            label: "Post-Event Activities",
            description: "Complete event closure activities",
            actions: ["Generate attendance reports", "Collect feedback", "Issue certificates", "Submit final reports"]
          }
        ]
      }
    ],
    tips: [
      "Save drafts frequently while creating events",
      "Use templates for recurring event types",
      "Set up automated email reminders for participants",
      "Keep track of participant feedback for future improvements",
      "Maintain detailed records for audit purposes"
    ]
  };

  const participantGuide = {
    overview: {
      title: "Participant Dashboard Overview",
      description: "Your gateway to discovering, registering for, and participating in events.",
      features: [
        { icon: <Dashboard />, title: "Dashboard", desc: "Overview of your activities and statistics" },
        { icon: <Search />, title: "Browse Events", desc: "Discover available events and workshops" },
        { icon: <Assignment />, title: "My Events", desc: "Track your registrations and attendance" },
        { icon: <Feedback />, title: "Feedback", desc: "Provide feedback for attended events" },
        { icon: <CardMembership />, title: "Certificates", desc: "Download your earned certificates" },
        { icon: <Person />, title: "Profile", desc: "Manage your personal information" }
      ]
    },
    workflows: [
      {
        title: "Finding and Registering for Events",
        steps: [
          {
            label: "Browse Events",
            description: "Explore available events that match your interests",
            actions: ["Go to 'Browse Events' section", "Use filters to find relevant events", "Read event descriptions and requirements", "Check schedules and venues"]
          },
          {
            label: "Register for Event",
            description: "Complete the registration process",
            actions: ["Click 'Register' on desired event", "Fill in registration form", "Confirm your details", "Submit registration"]
          },
          {
            label: "Prepare for Event",
            description: "Get ready for your registered events",
            actions: ["Check 'My Events' for updates", "Note event timings and venue", "Prepare required materials", "Set calendar reminders"]
          }
        ]
      },
      {
        title: "Participating and Getting Certificates",
        steps: [
          {
            label: "Attend Event",
            description: "Participate actively in the event",
            actions: ["Arrive on time", "Engage in sessions", "Complete required activities", "Network with other participants"]
          },
          {
            label: "Provide Feedback",
            description: "Share your experience to help improve future events",
            actions: ["Go to 'Feedback Portal'", "Rate the event", "Provide detailed comments", "Submit feedback form"]
          },
          {
            label: "Download Certificate",
            description: "Get your participation certificate",
            actions: ["Check 'My Certificates'", "Verify certificate details", "Download PDF certificate", "Share on social media if desired"]
          }
        ]
      }
    ],
    tips: [
      "Register early as events may have limited capacity",
      "Keep your profile updated for better event recommendations",
      "Set up notifications to stay informed about new events",
      "Provide honest feedback to help improve future events",
      "Download certificates promptly after event completion"
    ]
  };

  const adminGuide = {
    overview: {
      title: "System Admin Dashboard Overview",
      description: "Administrative control panel for system management and user oversight.",
      features: [
        { icon: <People />, title: "User Management", desc: "Manage user accounts and permissions" },
        { icon: <Settings />, title: "System Config", desc: "Configure system settings and parameters" },
        { icon: <Assessment />, title: "Analytics", desc: "System usage and performance metrics" },
        { icon: <Security />, title: "Security", desc: "Access control and security monitoring" },
        { icon: <CloudDownload />, title: "Backups", desc: "Data backup and recovery management" },
        { icon: <Notifications />, title: "Alerts", desc: "System alerts and notifications" }
      ]
    },
    workflows: [
      {
        title: "User Account Management",
        steps: [
          {
            label: "Create User Accounts",
            description: "Set up new user accounts for different roles",
            actions: ["Access user management panel", "Select user role (HOD/Coordinator/Participant)", "Enter user details", "Set initial permissions"]
          },
          {
            label: "Manage Permissions",
            description: "Configure role-based access controls",
            actions: ["Review user roles", "Modify permissions as needed", "Handle role changes", "Audit access logs"]
          },
          {
            label: "Handle Support Requests",
            description: "Resolve user issues and technical problems",
            actions: ["Monitor support tickets", "Investigate reported issues", "Implement solutions", "Follow up with users"]
          }
        ]
      },
      {
        title: "System Maintenance",
        steps: [
          {
            label: "Monitor Performance",
            description: "Track system health and performance metrics",
            actions: ["Check system dashboards", "Monitor resource usage", "Review error logs", "Identify performance bottlenecks"]
          },
          {
            label: "Perform Backups",
            description: "Ensure data safety through regular backups",
            actions: ["Schedule automated backups", "Verify backup integrity", "Test recovery procedures", "Maintain backup retention policies"]
          },
          {
            label: "Apply Updates",
            description: "Keep system updated and secure",
            actions: ["Review available updates", "Test in staging environment", "Schedule maintenance windows", "Deploy updates safely"]
          }
        ]
      }
    ],
    tips: [
      "Regularly monitor system logs for unusual activity",
      "Maintain detailed documentation of system changes",
      "Test backup and recovery procedures periodically",
      "Keep security patches up to date",
      "Provide clear communication during maintenance windows"
    ]
  };

  const guides = [hodGuide, coordinatorGuide, participantGuide, adminGuide];
  const currentGuide = guides[selectedRole];

  const renderWorkflowStep = (step, index) => (
    <Step key={index}>
      <StepLabel>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {step.label}
        </Typography>
      </StepLabel>
      <StepContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {step.description}
        </Typography>
        <List dense>
          {step.actions.map((action, actionIndex) => (
            <ListItem key={actionIndex}>
              <ListItemIcon>
                <PlayArrow color="primary" />
              </ListItemIcon>
              <ListItemText primary={action} />
            </ListItem>
          ))}
        </List>
      </StepContent>
    </Step>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        mb: 2
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Dashboard User Guide
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Role Selection Sidebar */}
          <Box sx={{ 
            width: 300, 
            borderRight: 1, 
            borderColor: 'divider',
            background: 'rgba(255,255,255,0.9)',
            p: 2
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
              Select Role
            </Typography>
            {roles.map((role, index) => (
              <Card
                key={index}
                sx={{
                  mb: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: selectedRole === index ? `2px solid ${role.color}` : '1px solid #e0e0e0',
                  background: selectedRole === index ? alpha(role.color, 0.1) : 'white',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => setSelectedRole(index)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ color: role.color, mr: 1 }}>
                      {role.icon}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {role.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {role.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Guide Content */}
          <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
            {/* Overview Section */}
            <Paper sx={{ p: 3, mb: 3, background: 'rgba(255,255,255,0.9)' }}>
              <Typography variant="h4" sx={{ 
                mb: 2, 
                fontWeight: 'bold',
                color: roles[selectedRole].color
              }}>
                {currentGuide.overview.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
                {currentGuide.overview.description}
              </Typography>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Key Features:
              </Typography>
              <Grid container spacing={2}>
                {currentGuide.overview.features.map((feature, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card sx={{ 
                      height: '100%',
                      background: alpha(roles[selectedRole].color, 0.05),
                      border: `1px solid ${alpha(roles[selectedRole].color, 0.2)}`
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ color: roles[selectedRole].color, mr: 1 }}>
                            {feature.icon}
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {feature.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {feature.desc}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Workflows Section */}
            <Paper sx={{ p: 3, mb: 3, background: 'rgba(255,255,255,0.9)' }}>
              <Typography variant="h5" sx={{ 
                mb: 3, 
                fontWeight: 'bold',
                color: roles[selectedRole].color
              }}>
                Step-by-Step Workflows
              </Typography>

              {currentGuide.workflows.map((workflow, workflowIndex) => (
                <Accordion key={workflowIndex} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {workflow.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stepper orientation="vertical">
                      {workflow.steps.map((step, stepIndex) => 
                        renderWorkflowStep(step, stepIndex)
                      )}
                    </Stepper>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>

            {/* Tips Section */}
            <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.9)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Lightbulb sx={{ color: '#ffa726', mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ffa726' }}>
                  Pro Tips & Best Practices
                </Typography>
              </Box>
              <List>
                {currentGuide.tips.map((tip, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={tip}
                      primaryTypographyProps={{ fontSize: '1rem' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Quick Help Alert */}
            <Alert 
              severity="info" 
              sx={{ mt: 3 }}
              icon={<Info />}
            >
              <Typography variant="body1">
                <strong>Need more help?</strong> Contact the system administrator or refer to the detailed documentation 
                available in your dashboard's help section.
              </Typography>
            </Alert>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, background: 'rgba(255,255,255,0.9)' }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          sx={{ 
            background: `linear-gradient(45deg, ${roles[selectedRole].color} 30%, ${alpha(roles[selectedRole].color, 0.8)} 90%)`,
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          Got It!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardGuide;