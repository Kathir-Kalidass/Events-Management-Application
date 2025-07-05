import React, { useState, useEffect } from 'react';
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
  Snackbar
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { convenorCommitteeAPI } from '../../../services/api';

const ConvenorCommitteeManagement = () => {
  const [members, setMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
    role: 'Member'
  });

  // Fetch members on component mount
  useEffect(() => {
    fetchMembers();
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
      role: 'Member'
    });
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      designation: member.designation,
      department: member.department,
      role: member.role
    });
    setOpen(true);
  };

  const handleAdd = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      designation: '',
      department: '',
      role: 'Member'
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editingMember) {
        await convenorCommitteeAPI.update(editingMember._id, formData);
        showSnackbar('Member updated successfully');
      } else {
        await convenorCommitteeAPI.add(formData);
        showSnackbar('Member added successfully');
      }
      fetchMembers();
      handleClose();
    } catch (error) {
      showSnackbar('Error saving member: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        setLoading(true);
        await convenorCommitteeAPI.delete(id);
        showSnackbar('Member deleted successfully');
        fetchMembers();
      } catch (error) {
        showSnackbar('Error deleting member: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Convenor Committee Members</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
          disabled={loading}
        >
          Add Member
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Designation</strong></TableCell>
              <TableCell><strong>Department</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member._id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.designation}</TableCell>
                <TableCell>{member.department}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(member)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(member._id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMember ? 'Edit Convenor Committee Member' : 'Add Convenor Committee Member'}
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
            />
            <TextField
              name="department"
              label="Department"
              value={formData.department}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              name="role"
              label="Role"
              value={formData.role}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              select
              SelectProps={{ native: true }}
            >
              <option value="Member">Member</option>
              <option value="Chairman">Chairman</option>
              <option value="Secretary">Secretary</option>
              <option value="Vice-Chairman">Vice-Chairman</option>
              <option value="Treasurer">Treasurer</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.name.trim()}
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
