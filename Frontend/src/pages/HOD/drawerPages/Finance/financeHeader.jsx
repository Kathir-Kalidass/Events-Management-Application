import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";

const FinanceHeader = () => {
  return (
    <Box>
      <AppBar position="static" color="default" elevation={1}>
              <Toolbar
                sx={{ justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccountBalanceIcon color="primary" />
                  <Box>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      Financial Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage budgets, expenses and revenue of events
                    </Typography>
                  </Box>
                </Box>
      
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Tooltip title="Filter View">
                    <IconButton color="primary">
                      <FilterListIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    color="primary"
                  >
                    Export
                  </Button>
                </Box>
              </Toolbar>
            </AppBar>
    </Box>
  )
}

export default FinanceHeader;