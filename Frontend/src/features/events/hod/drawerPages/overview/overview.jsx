import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  useTheme,
  alpha,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Button
} from "@mui/material";
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  AccountBalance as FinanceIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon
} from "@mui/icons-material";
import { eventState } from "../../../../../shared/context/eventProvider";
import DashboardCharts from "./eventstatistics";

const Overview = ({ activePage, setActivePage }) => {
  const theme = useTheme();
  const { user, events } = eventState();

  const approvedCount = () => events.filter(e => e.status === "approved").length;
  const pendingCount = () => events.filter(e => e.status === "pending").length;
  const rejectedCount = () => events.filter(e => e.status === "rejected").length;
  const totalBudget = () => events.reduce((sum, e) => sum + (Number(e.budget) || 0), 0);

  const statsCards = [
    {
      title: "Total Proposals",
      value: events.length,
      icon: <DescriptionIcon />,
      color: theme.palette.primary.main,
      bgGradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      changeType: "positive"
    },
    {
      title: "Approved Events",
      value: approvedCount(),
      icon: <CheckCircleIcon />,
      color: theme.palette.success.main,
      bgGradient: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
      changeType: "positive"
    },
    {
      title: "Pending Review",
      value: pendingCount(),
      icon: <ScheduleIcon />,
      color: theme.palette.warning.main,
      bgGradient: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
      changeType: "negative"
    },
    {
      title: "Rejected Proposals",
      value: rejectedCount(),
      icon: <CancelIcon />,
      color: theme.palette.error.main,
      bgGradient: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
      changeType: "positive"
    }
  ];

  const quickActions = [
    {
      title: "Review Proposals",
      description: "Review pending event proposals",
      icon: <ScheduleIcon />,
      action: () => setActivePage("pendingProposal"),
      color: theme.palette.warning.main,
      count: pendingCount()
    },
    {
      title: "Finance Overview",
      description: "Monitor budget and expenses",
      icon: <FinanceIcon />,
      action: () => setActivePage("finance"),
      color: theme.palette.info.main,
      count: `₹${totalBudget().toLocaleString()}`
    },
    {
      title: "Event Calendar",
      description: "View upcoming events",
      icon: <CalendarIcon />,
      action: () => setActivePage("calendar"),
      color: theme.palette.secondary.main,
      count: events.filter(e => new Date(e.endDate) > new Date()).length
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: '100%', mx: 'auto' }}>
      {/* Welcome Header */}
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: 4,
          p: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                backgroundColor: alpha(theme.palette.common.white, 0.2),
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 700
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'H'}
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                Welcome back, Dr. {user?.name || 'HOD'}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                Here's your department's event management overview
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Chip
                  label="Department Head"
                  sx={{
                    backgroundColor: alpha(theme.palette.success.main, 0.8),
                    color: 'white',
                    fontWeight: 600
                  }}
                />
                <Chip
                  label="Administrative Portal"
                  sx={{
                    backgroundColor: alpha(theme.palette.info.main, 0.8),
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: stat.bgGradient,
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: stat.changeType === 'positive' ? '#4ade80' : '#f87171',
                          fontWeight: 600
                        }}
                      >
                        {stat.change}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.common.white, 0.15),
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((stat.value / Math.max(events.length, 1)) * 100, 100)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.common.white, 0.2),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: alpha(theme.palette.common.white, 0.8),
                      borderRadius: 3
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          mb: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
          🚀 Quick Actions
        </Typography>
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${alpha(action.color, 0.2)}`,
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(action.color, 0.15)}`,
                    borderColor: action.color
                  }
                }}
                onClick={action.action}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      backgroundColor: alpha(action.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      color: action.color
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {action.description}
                  </Typography>
                  <Chip
                    label={action.count}
                    sx={{
                      backgroundColor: alpha(action.color, 0.1),
                      color: action.color,
                      fontWeight: 600
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Charts Section */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          background: theme.palette.background.paper
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
            📊 Event Analytics
          </Typography>
          <Button
            variant="outlined"
            startIcon={<TrendingUpIcon />}
            onClick={() => console.log("View detailed analytics")}
            sx={{ borderRadius: 2 }}
          >
            View Details
          </Button>
        </Box>
        <DashboardCharts />
      </Paper>
    </Box>
  );
};

export default Overview;
