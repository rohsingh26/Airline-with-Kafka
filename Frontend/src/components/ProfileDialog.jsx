import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function ProfileDialog({ open, onClose }) {
  const { user, updateName } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateName(name.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (open) setName(user?.name || "");
  }, [open, user]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Edit Profile</DialogTitle>

      <DialogContent>
        {/* User Info Section (left side style) */}
        <Box sx={{ mb: 2, p: 2, bgcolor: "#f9f9f9", borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, fontWeight: 600, color: "#D4AF37" }}
          >
            {user?.role?.toUpperCase()}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Editable Name Field */}
        <TextField
          fullWidth
          label="Name"
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !name.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
