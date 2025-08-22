import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Snackbar,
  Alert,
  Dialog, // For edit/delete modals
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { styled } from '@mui/material/styles'; // Import styled for custom TableRow
import EditIcon from "@mui/icons-material/Edit"; // Edit icon
import DeleteIcon from "@mui/icons-material/Delete"; // Delete icon
import CloseIcon from "@mui/icons-material/Close"; // Close icon for dialogs

// Corrected import path for api.js - assuming it's one level up in the services directory
import { register, listUsers, updateUser, deleteUser } from "../../services/api.js"; // Changed from ../../services to ../services

// Custom styled TableRow for hover effect and alternating colors
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover, // Subtle background for odd rows
  },
  // Hide last border to avoid double border on some tables
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected, // Highlight on hover
  },
}));

const AddUsers = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "airline",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // For different success messages

  // State for editing user
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // Stores the user being edited
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "airline",
  });
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // State for deleting user
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token = localStorage.getItem("token"); // admin token

  // --- Form for Adding Users ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const clearForm = () => {
    setForm({ name: "", email: "", password: "", role: "airline" });
    setError("");
  };

  const fetchUsers = async () => {
    try {
      const data = await listUsers(token);
      // Filter for staff roles (airline, baggage)
      const staff = data.filter((u) => ["airline", "baggage"].includes(u.role));
      setUsers(staff);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      // Optionally set an error state here for fetching users
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]); // Re-fetch if token changes

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await register(form);
      clearForm();
      fetchUsers();
      setSuccessMessage("User added successfully!");
      setSuccessOpen(true); // show success notification
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSuccessOpen(false);
  };

  // --- Edit User Functionality ---
  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role });
    setEditError("");
    setEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setEditLoading(true);
    setEditError("");
    try {
      await updateUser(editingUser._id, editForm, token);
      fetchUsers(); // Re-fetch the list to show updated user
      setEditModalOpen(false);
      setSuccessMessage("User updated successfully!");
      setSuccessOpen(true);
    } catch (err) {
      setEditError(err.response?.data?.error || "Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingUser(null);
    setEditError("");
  };

  // --- Delete User Functionality ---
  const handleDeleteClick = (userId) => {
    setUserToDeleteId(userId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDeleteId) return;

    setDeleteLoading(true);
    try {
      await deleteUser(userToDeleteId, token);
      fetchUsers(); // Re-fetch the list to show user removed
      setDeleteConfirmOpen(false);
      setUserToDeleteId(null);
      setSuccessMessage("User deleted successfully!");
      setSuccessOpen(true);
    } catch (err) {
      console.error("Failed to delete user:", err);
      setEditError(err.response?.data?.error || "Failed to delete user");
      setSuccessOpen(true);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setUserToDeleteId(null);
  };

  return (
    <Box
      sx={{
        minWidth: "280px",
        maxWidth: 1212,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 4, // Space between form and table

      }}
    >
      {/* Form to Add Users */}
      <Paper
        elevation={6} // Stronger shadow
        sx={{
          p: { xs: 2, sm: 2, md: 4 }, // Responsive padding
          borderRadius: 3,
          backgroundColor: 'background.paper', // Use theme background color
          display: 'flex',
          flexDirection: 'column',
           // Center content horizontally
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
            Add Staff User
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, width: '100%', maxWidth: 500 }}> {/* Centered error */}
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ maxWidth: 1130, width: '100%', gap:3 }}> {/* Constrain width and center Grid */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              variant="outlined"
              sx={{ '& fieldset': { borderRadius: 2 } }} // Rounded corners for input
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              variant="outlined"
              sx={{ '& fieldset': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              variant="outlined"
              sx={{ '& fieldset': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Role"
              name="role"
              value={form.role}
              onChange={handleChange}
              variant="outlined"
              sx={{ '& fieldset': { borderRadius: 2 } }}
            >
              <MenuItem value="airline">Airline Staff</MenuItem>
              <MenuItem value="baggage">Baggage Staff</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              sx={{ py: 1.8, borderRadius: 2, fontWeight: 600, textTransform: 'none', boxShadow: 3 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add User"}
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              fullWidth
              sx={{ py: 1.8, borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
              onClick={clearForm}
              disabled={loading}
            >
              Clear Form
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, sm: 3 }, // Responsive padding
          borderRadius: 3,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h5" fontWeight={600} mb={3} color="text.primary">
          Staff Users
        </Typography>
        {users.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>No staff added yet</Typography>
        ) : (
          <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table aria-label="staff users table">
              <TableHead sx={{ backgroundColor: '#af9233ff' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText', width: "120px" }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
                <TableBody>
                    {users.map((u) => (
                        <StyledTableRow key={u._id}>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        {/* Capitalize role */}
                        <TableCell>
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </TableCell>
                        <TableCell align="center">
                            <IconButton
                            aria-label="edit"
                            color="primary"
                            onClick={() => handleEditClick(u)}
                            size="small"
                            >
                            <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                            aria-label="delete"
                            color="error"
                            onClick={() => handleDeleteClick(u._id)}
                            size="small"
                            >
                            <DeleteIcon fontSize="small" />
                            </IconButton>
                        </TableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Snackbar Notification */}
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled" // Filled variant for better visibility
          sx={{ width: "100%", bgcolor: 'success.main' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Edit User Dialog */}
      <Dialog open={editModalOpen} onClose={handleCloseEditModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1 }}>
          <Typography variant="h6" component="div">Edit User</Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseEditModal}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            name="name"
            value={editForm.name}
            onChange={handleEditFormChange}
            sx={{ mb: 2, '& fieldset': { borderRadius: 2 } }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            name="email"
            value={editForm.email}
            onChange={handleEditFormChange}
            sx={{ mb: 2, '& fieldset': { borderRadius: 2 } }}
          />
          <TextField
            margin="dense"
            select
            label="Role"
            fullWidth
            variant="outlined"
            name="role"
            value={editForm.role}
            onChange={handleEditFormChange}
            sx={{ '& fieldset': { borderRadius: 2 } }}
          >
            <MenuItem value="airline">Airline Staff</MenuItem>
            <MenuItem value="baggage">Baggage Staff</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseEditModal} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained" disabled={editLoading} sx={{ borderRadius: 2, textTransform: 'none' }}>
            {editLoading ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm} maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1 }}>
          <Typography variant="h6" component="div">Confirm Delete</Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseDeleteConfirm}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 2 }}>Are you sure you want to delete this user?</Typography>
          {editError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {editError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteConfirm} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleteLoading} sx={{ borderRadius: 2, textTransform: 'none' }}>
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddUsers;