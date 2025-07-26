import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  useTheme,
  alpha,
  Avatar,
  Chip,
  Badge,
  Paper,
  Tooltip
} from "@mui/material";
import {
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  History as HistoryIcon,
  CheckCircle as ApprovedIcon,
  HourglassEmpty as PendingIcon,
  AccountBalance as FinanceIcon,
  Group as GroupIcon,
  Draw as SignatureIcon,
  Person as ProfileIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  Description as BrochureIcon,
  ExitToApp as LogoutIcon,
  School as SchoolIcon,
  ChevronRight as ChevronRightIcon,
  Star as StarIcon,
  Settings as SettingsIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { eventState } from "../../../../shared/context/eventProvider";

export default function TemporaryDrawer({
  open,
  onClose,
  activePage,
  setActivePage,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = eventState();

  const menuItems = [
    {
      id: "overview",
      label: "Dashboard",
      icon: <DashboardIcon />,
      handler: () => setActivePage("overview"),
      color: theme.palette.primary.main,
      emoji: "📊",
      description: "Overview & Analytics"
    },
    {
      id: "proposal",
      label: "Event History",
      icon: <HistoryIcon />,
      handler: () => setActivePage("proposal"),
      color: theme.palette.info.main,
      emoji: "📋",
      description: "Past Events & Records"
    },
    {
      id: "approved",
      label: "Approved Events",
      icon: <ApprovedIcon />,
      handler: () => setActivePage("approved"),
      color: theme.palette.success.main,
      emoji: "✅",
      description: "Sanctioned Events"
    },
    {
      id: "pendingProposal",
      label: "Pending Proposals",
      icon: <PendingIcon />,
      handler: () => setActivePage("pendingProposal"),
      color: theme.palette.warning.main,
      emoji: "⏳",
      description: "Awaiting Review"
    },
    {
      id: "finance",
      label: "Finance Management",
      icon: <FinanceIcon />,
      handler: () => setActivePage("finance"),
      color: theme.palette.secondary.main,
      emoji: "💰",
      description: "Budget & Expenses"
    },
    {
      id: "convenorCommittee",
      label: "Event Organizers",
      icon: <GroupIcon />,
      handler: () => setActivePage("convenorCommittee"),
      color: theme.palette.info.main,
      emoji: "👥",
      description: "Committee Management"
    },
    {
      id: "signatureManagement",
      label: "Digital Signatures",
      icon: <SignatureIcon />,
      handler: () => setActivePage("signatureManagement"),
      color: theme.palette.primary.main,
      emoji: "✍️",
      description: "E-Signature Setup"
    },
    {
      id: "profile",
      label: "Profile Settings",
      icon: <ProfileIcon />,
      handler: () => setActivePage("profile"),
      color: theme.palette.secondary.main,
      emoji: "👤",
      description: "Account Management"
    },
    {
      id: "calendar",
      label: "Event Calendar",
      icon: <CalendarIcon />,
      handler: () => setActivePage("calendar"),
      color: theme.palette.info.main,
      emoji: "📅",
      description: "Schedule Overview"
    },
    {
      id: "notifications",
      label: "Notification Center",
      icon: <NotificationsIcon />,
      handler: () => setActivePage("notifications"),
      color: theme.palette.warning.main,
      emoji: "🔔",
      description: "Alerts & Updates"
    }
  ];

  const handleItemClick = (item) => {
    item.handler();
    onClose();
  };

  const handleBrochureManagement = () => {
    onClose();
    navigate("/hod/brochures");
  };

  const handleLogOut = () => {
    onClose();
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    navigate("/");
  };

  return (
    <Drawer 
      anchor="left" 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 380,
          background: theme.palette.background.paper,
          borderRight: 'none',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
        }
      }}
    >
      {/* Enhanced Header */}
      <Box
        sx={{
          p: 4,
          background: `linear-gradient(135deg, 
            ${theme.palette.primary.main} 0%, 
            ${theme.palette.primary.dark} 50%, 
            ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 50%, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.light, 0.1)} 0%, transparent 50%),
              url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
            `,
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.2)} 0%, ${alpha(theme.palette.common.white, 0.1)} 100%)`,
                backdropFilter: 'blur(15px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <SchoolIcon sx={{ fontSize: 32, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 800, 
                mb: 0.5,
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                background: `linear-gradient(45deg, ${theme.palette.common.white} 0%, ${alpha(theme.palette.common.white, 0.8)} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                🎓 HOD Portal
              </Typography>
              <Typography variant="body2" sx={{ 
                opacity: 0.9,
                fontWeight: 500,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}>
                Administrative Dashboard
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: 'white',
              background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.15)} 0%, ${alpha(theme.palette.common.white, 0.05)} 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.25)} 0%, ${alpha(theme.palette.common.white, 0.15)} 100%)`,
                transform: 'scale(1.05) rotate(90deg)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Enhanced User Info */}
        {user && (
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.15)} 0%, ${alpha(theme.palette.common.white, 0.05)} 100%)`,
              backdropFilter: 'blur(15px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
              position: 'relative',
              zIndex: 1,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.3)} 0%, ${alpha(theme.palette.common.white, 0.1)} 100%)`,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    border: `3px solid ${alpha(theme.palette.common.white, 0.4)}`,
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                  }}
                >
                  {user.name?.charAt(0)?.toUpperCase() || 'H'}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                    border: `2px solid white`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <StarIcon sx={{ fontSize: 12, color: 'white' }} />
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  mb: 0.5,
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}>
                  Dr. {user.name || 'Head of Department'}
                </Typography>
                <Typography variant="body2" sx={{ 
                  opacity: 0.9, 
                  mb: 1,
                  fontWeight: 500
                }}>
                  {user.department || 'Department Head'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label="HOD"
                    size="small"
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      height: 24,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      '& .MuiChip-label': {
                        px: 1.5
                      }
                    }}
                  />
                  <Chip
                    label="ADMIN"
                    size="small"
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      height: 24,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      '& .MuiChip-label': {
                        px: 1.5
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Enhanced Navigation Menu */}
      <Box sx={{ flex: 1, py: 3 }}>
        <Typography 
          variant="overline" 
          sx={{ 
            px: 3, 
            mb: 2, 
            display: 'block',
            fontWeight: 700,
            color: theme.palette.text.secondary,
            letterSpacing: 1.2
          }}
        >
          🚀 NAVIGATION
        </Typography>
        
        <List sx={{ px: 3 }}>
          {menuItems.map((item, index) => (
            <ListItem
              key={item.id}
              component="button"
              onClick={() => handleItemClick(item)}
              sx={{
                mb: 1.5,
                borderRadius: 3,
                p: 2,
                background: activePage === item.id 
                  ? `linear-gradient(135deg, ${alpha(item.color, 0.15)} 0%, ${alpha(item.color, 0.05)} 100%)`
                  : 'transparent',
                border: activePage === item.id 
                  ? `2px solid ${alpha(item.color, 0.3)}` 
                  : '2px solid transparent',
                boxShadow: activePage === item.id 
                  ? `0 8px 25px ${alpha(item.color, 0.15)}`
                  : 'none',
                '&:hover': {
                  background: `linear-gradient(135deg, ${alpha(item.color, 0.1)} 0%, ${alpha(item.color, 0.03)} 100%)`,
                  transform: 'translateX(8px) scale(1.02)',
                  boxShadow: `0 8px 25px ${alpha(item.color, 0.12)}`,
                  borderColor: alpha(item.color, 0.2)
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: activePage === item.id 
                      ? `linear-gradient(135deg, ${item.color} 0%, ${alpha(item.color, 0.8)} 100%)`
                      : `linear-gradient(135deg, ${alpha(item.color, 0.1)} 0%, ${alpha(item.color, 0.05)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    color: activePage === item.id ? 'white' : item.color,
                    boxShadow: activePage === item.id 
                      ? `0 4px 15px ${alpha(item.color, 0.3)}`
                      : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item.icon}
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontSize: '1rem' }}>
                      {item.emoji}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: activePage === item.id ? 700 : 600,
                        color: activePage === item.id ? item.color : theme.palette.text.primary,
                        fontSize: '0.95rem'
                      }}
                    >
                      {item.label}
                    </Typography>
                    {item.badge && (
                      <Badge 
                        badgeContent={item.badge} 
                        color="error"
                        sx={{
                          '& .MuiBadge-badge': {
                            background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            fontSize: '0.7rem',
                            fontWeight: 700
                          }
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                      opacity: 0.8
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>

                <ChevronRightIcon 
                  sx={{ 
                    color: activePage === item.id ? item.color : theme.palette.text.secondary,
                    opacity: activePage === item.id ? 1 : 0.5,
                    transform: activePage === item.id ? 'translateX(4px)' : 'translateX(0)',
                    transition: 'all 0.3s ease'
                  }} 
                />
              </Box>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 3, mx: 3, borderColor: alpha(theme.palette.divider, 0.1) }} />

        {/* Enhanced Additional Actions */}
        <Typography 
          variant="overline" 
          sx={{ 
            px: 3, 
            mb: 2, 
            display: 'block',
            fontWeight: 700,
            color: theme.palette.text.secondary,
            letterSpacing: 1.2
          }}
        >
          ⚡ QUICK ACTIONS
        </Typography>

        <List sx={{ px: 3 }}>
          <ListItem
            component="button"
            onClick={handleBrochureManagement}
            sx={{
              mb: 1.5,
              borderRadius: 3,
              p: 2,
              border: `2px solid transparent`,
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.03)} 100%)`,
                transform: 'translateX(8px) scale(1.02)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.12)}`,
                borderColor: alpha(theme.palette.info.main, 0.2)
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  color: theme.palette.info.main
                }}
              >
                <BrochureIcon />
              </Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  flex: 1
                }}
              >
                📄 Brochure Management
              </Typography>
            </Box>
          </ListItem>

          <ListItem
            component="button"
            onClick={handleLogOut}
            sx={{
              borderRadius: 3,
              p: 2,
              border: `2px solid transparent`,
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.03)} 100%)`,
                transform: 'translateX(8px) scale(1.02)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.12)}`,
                borderColor: alpha(theme.palette.error.main, 0.2)
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  color: theme.palette.error.main
                }}
              >
                <LogoutIcon />
              </Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.error.main,
                  flex: 1
                }}
              >
                🚪 Logout
              </Typography>
            </Box>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}
