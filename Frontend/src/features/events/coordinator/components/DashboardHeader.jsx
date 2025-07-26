import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  alpha,
  Chip,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add,
  Dashboard,
  ExitToApp,
  Person,
  School,
  AccountCircle
} from '@mui/icons-material';
import { eventState } from '../../../../shared/context/eventProvider';
import ProfileDialog from './ProfileDialog';

const DashboardHeader = ({ onLogout, onCreateNew }) => {
  const theme = useTheme();
  const { user } = eventState();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
    <Paper
      elevation={3}
      sx={{
        mb: 4,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 3,
          position: 'relative',
          zIndex: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.common.white, 0.15),
              backdropFilter: 'blur(10px)'
            }}
          >
            <Dashboard sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                mb: 0.5,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Coordinator Dashboard
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                opacity: 0.9,
                fontWeight: 400
              }}
            >
              Manage events, participants, and administrative tasks
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          {/* User Info */}
          {user && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              px: 2,
              py: 1,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.common.white, 0.1),
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.15)
              },
              transition: 'all 0.2s ease-in-out'
            }}
            onClick={() => setProfileOpen(true)}
            >
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40,
                  backgroundColor: alpha(theme.palette.common.white, 0.2),
                  color: 'white',
                  fontWeight: 600
                }}
              >
                {user.name?.charAt(0)?.toUpperCase() || 'C'}
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user.name || 'Coordinator'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                  {user.designation || 'Event Coordinator'}
                </Typography>
              </Box>
              <Tooltip title="View Profile">
                <IconButton 
                  size="small"
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1)
                    }
                  }}
                >
                  <AccountCircle />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<ExitToApp />}
              onClick={onLogout}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Logout
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onCreateNew}
              sx={{
                backgroundColor: alpha(theme.palette.common.white, 0.95),
                color: theme.palette.primary.main,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  backgroundColor: theme.palette.common.white,
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Create Note Order
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>

    {/* Profile Dialog */}
    <ProfileDialog 
      open={profileOpen} 
      onClose={() => setProfileOpen(false)} 
    />
    </>
  );
};

export default DashboardHeader;