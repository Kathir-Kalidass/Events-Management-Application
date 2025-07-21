import React, { useState, useEffect } from 'react';
import { convenorCommitteeAPI } from "../../../../shared/services/api";
import { ORGANIZING_COMMITTEE } from "../../../../shared/constants/universityInfo";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Add, 
  ExpandMore, 
  Settings,
  Group,
  AdminPanelSettings,
  School,
  Business,
  AccountTree,
  People
} from '@mui/icons-material';

const ConvenorCommitteeManagement = () => {
  const [members, setMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [availableRoles, setAvailableRoles] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
    customDepartment: '',
    role: 'Member',
    roleCategory: 'COMMITTEE',
    description: '',
    isDefault: false
  });

  // Fetch members and available roles on component mount
  useEffect(() => {
    fetchMembers();
    fetchAvailableRoles();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await convenorCommitteeAPI.getAll();
      setMembers(response.data || []);
    } catch (error) {
      showSnackbar('Error fetching members: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      const response = await convenorCommitteeAPI.getAvailableRoles();
      setAvailableRoles(response.data);
    } catch (error) {
      console.error('Error fetching available roles:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMember(null);
    setFormData({
      name: '',
      designation: '',
      department: '',
      customDepartment: '',
      role: 'Member',
      roleCategory: 'COMMITTEE',
      description: '',
      isDefault: false
    });
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    const isCustomDept = !ORGANIZING_COMMITTEE.commonOrganizations.includes(member.department);
    setFormData({
      name: member.name || '',
      designation: member.designation || '',
      department: isCustomDept ? 'Other' : (member.department || ''),
      customDepartment: isCustomDept ? member.department : '',
      role: member.role || 'Member',
      roleCategory: member.roleCategory || 'COMMITTEE',
      description: member.description || '',
      isDefault: member.isDefault || false
    });
    setOpen(true);
  };

  const handleAdd = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      designation: '',
      department: '',
      customDepartment: '',
      role: 'Member',
      roleCategory: 'COMMITTEE',
      description: '',
      isDefault: false
    });
    setOpen(true);
  };

  const handleInitializeDefault = async () => {
    try {
      setLoading(true);
      const response = await convenorCommitteeAPI.initializeDefault();
      showSnackbar(response.message);
      fetchMembers();
      fetchAvailableRoles();
    } catch (error) {
      showSnackbar('Error initializing default committee: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Prepare data with the correct department value
      const submitData = {
        ...formData,
        department: formData.department === 'Other' ? formData.customDepartment : formData.department
      };
      
      if (editingMember) {
        await convenorCommitteeAPI.update(editingMember._id, submitData);
        showSnackbar('Event organizer updated successfully');
      } else {
        await convenorCommitteeAPI.add(submitData);
        showSnackbar('Event organizer added successfully');
      }
      fetchMembers();
      fetchAvailableRoles(); // Refresh available roles
      handleClose();
    } catch (error) {
      showSnackbar('Error saving organizer: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        setLoading(true);
        await convenorCommitteeAPI.delete(id);
        showSnackbar('Organizing committee member deleted successfully');
        fetchMembers();
        fetchAvailableRoles(); // Refresh available roles
      } catch (error) {
        showSnackbar('Error deleting member: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setFormData({
      ...formData,
      role: selectedRole,
      // Auto-set category based on role
      roleCategory: getRoleCategoryFromRole(selectedRole)
    });
  };

  const getRoleCategoryFromRole = (role) => {
    if (!availableRoles) return 'COMMITTEE';
    
    for (const [categoryKey, categoryData] of Object.entries(availableRoles.roleCategories)) {
      if (categoryData.roles.includes(role)) {
        return categoryKey;
      }
    }
    return 'COMMITTEE';
  };

  const getRoleIcon = (roleCategory) => {
    switch (roleCategory) {
      case 'PATRON': return <AdminPanelSettings />;
      case 'ADMINISTRATION': return <Business />;
      case 'ACADEMIC': return <School />;
      case 'ORGANIZING': return <Settings />;
      case 'COORDINATION': return <AccountTree />;
      case 'COMMITTEE': return <People />;
      default: return <Group />;
    }
  };

  const groupMembersByCategory = () => {
    const grouped = {};
    members.forEach(member => {
      const category = member.roleCategory || 'COMMITTEE';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(member);
    });
    return grouped;
  };

  const getCategoryDisplayName = (categoryKey) => {
    return availableRoles?.roleCategories[categoryKey]?.name || categoryKey;
  };

  const isRoleOccupied = (role) => {
    return availableRoles?.occupiedSingleInstanceRoles?.includes(role) || false;
  };

  const isSingleInstanceRole = (role) => {
    return availableRoles?.singleInstanceRoles?.includes(role) || false;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5"><b>Event Organizers Management</b></Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <div><p>(Add honorifics to the name itself)</p></div>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={handleInitializeDefault}
            disabled={loading}
          >
            Initialize Default
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
            disabled={loading}
          >
            Add Organizer
          </Button>
        </Box>
      </Box>

      {/* Display members grouped by category */}
      {Object.entries(groupMembersByCategory()).map(([categoryKey, categoryMembers]) => (
        <Accordion key={categoryKey} defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getRoleIcon(categoryKey)}
              <Typography variant="h6">
                {getCategoryDisplayName(categoryKey)} ({categoryMembers.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Designation</strong></TableCell>
                    <TableCell><strong>Department</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryMembers.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {member.role}
                          </Typography>
                          {isSingleInstanceRole(member.role) && (
                            <Tooltip title="Single instance role">
                              <Chip size="small" label="Unique" color="primary" />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.designation}</TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {member.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={member.isDefault ? 'Default' : 'Custom'} 
                          color={member.isDefault ? 'secondary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(member)} color="primary" size="small">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(member._id)} color="error" size="small">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {categoryMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary">
                          No members in this category
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* If no members exist */}
      {members.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No organizing committee members found
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            Start by initializing the default committee structure or add members manually.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={handleInitializeDefault}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            Initialize Default Committee
          </Button>
        </Paper>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMember ? 'Edit Event Organizer' : 'Add Event Organizer'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              name="designation"
              label="Designation"
              value={formData.designation}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Department/Organization</InputLabel>
              <Select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                label="Department/Organization"
              >
                {ORGANIZING_COMMITTEE.commonOrganizations.map((org) => (
                  <MenuItem key={org} value={org}>
                    {org}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {formData.department === 'Other' && (
              <TextField
                name="customDepartment"
                label="Specify Department/Organization"
                value={formData.customDepartment || ''}
                onChange={(e) => setFormData({...formData, customDepartment: e.target.value})}
                fullWidth
                margin="normal"
                required
                placeholder="Enter custom department or organization"
              />
            )}
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Role Category</InputLabel>
              <Select
                name="roleCategory"
                value={formData.roleCategory}
                onChange={handleInputChange}
                label="Role Category"
              >
                {availableRoles && Object.entries(availableRoles.roleCategories).map(([key, category]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getRoleIcon(key)}
                      {category.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleRoleChange}
                label="Role"
              >
                {availableRoles && formData.roleCategory && 
                  availableRoles.roleCategories[formData.roleCategory]?.roles.map((role) => {
                    const isOccupied = isRoleOccupied(role);
                    const isSingle = isSingleInstanceRole(role);
                    const isCurrentRole = editingMember?.role === role;
                    
                    return (
                      <MenuItem 
                        key={role} 
                        value={role}
                        disabled={isOccupied && !isCurrentRole}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <span>{role}</span>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {isSingle && (
                              <Chip size="small" label="Unique" color="primary" />
                            )}
                            {isOccupied && !isCurrentRole && (
                              <Chip size="small" label="Occupied" color="error" />
                            )}
                          </Box>
                        </Box>
                      </MenuItem>
                    );
                  })
                }
              </Select>
            </FormControl>

            <TextField
              name="description"
              label="Role Description (Optional)"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={2}
              placeholder="Brief description of role responsibilities"
            />

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                style={{ marginRight: '8px' }}
              />
              <label htmlFor="isDefault">
                <Typography variant="body2">
                  Default role (appears in all events)
                </Typography>
              </label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              loading || 
              !formData.name.trim() || 
              !formData.designation.trim() || 
              !formData.department.trim() ||
              (formData.department === 'Other' && !formData.customDepartment?.trim())
            }
          >
            {editingMember ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ConvenorCommitteeManagement;
