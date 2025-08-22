import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import * as api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function BaggageList({ embedded = false }) {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [patch, setPatch] = useState({ status: "", lastLocation: "" });

  const statusOptions = [
    { value: "checkin", label: "Check-in" },
    { value: "loaded", label: "Loaded" },
    { value: "inTransit", label: "In Transit" },
    { value: "unloaded", label: "Unloaded" },
    { value: "atBelt", label: "At Belt" },
    { value: "lost", label: "Lost" },
  ];

  const load = async () => {
    try {
      const data = await api.listBaggage(token);
      setRows(data);
    } catch (e) {
      setErr("Failed to load baggage");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this baggage?")) return;
    try {
      await api.deleteBaggage(id, token);
      setRows((prev) => prev.filter((r) => r._id !== id));
    } catch {
      alert("Failed to delete baggage");
    }
  };

  const startEdit = (row) => {
    setEditRow(row._id);
    setPatch({
      status: row.status || "",
      lastLocation: row.lastLocation || "",
    });
  };

  const saveEdit = async () => {
    try {
      await api.updateBaggage(editRow, patch, token);
      setEditRow(null);
      await load();
    } catch {
      alert("Failed to update baggage");
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (err) return <Alert severity="error">{err}</Alert>;

  if (rows.length === 0)
    return (
      <Box>
        <Alert severity="info">
          No baggage found. Add baggage via “Add Baggage” in the top bar.
        </Alert>
      </Box>
    );

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Baggage List
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Tag ID</TableCell>
            <TableCell>Flight</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Location</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((b) => (
            <TableRow
              key={b._id}
              sx={{
                backgroundColor: b.status === "lost" ? "rgba(218, 6, 6, 0.5)" : "inherit",
              }}
            >
              <TableCell>{b.tagId}</TableCell>
              <TableCell>{b.flightId?.flightNo}</TableCell>

              <TableCell>
                {editRow === b._id ? (
                  <TextField
                    size="small"
                    select
                    value={patch.status}
                    onChange={(e) => setPatch({ ...patch, status: e.target.value })}
                  >
                    {statusOptions.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  b.status
                )}
              </TableCell>

              <TableCell>
                {editRow === b._id ? (
                  <TextField
                    size="small"
                    value={patch.lastLocation}
                    onChange={(e) => setPatch({ ...patch, lastLocation: e.target.value })}
                  />
                ) : (
                  b.lastLocation ?? "-"
                )}
              </TableCell>

              <TableCell>
                {editRow === b._id ? (
                  <>
                    <Button size="small" variant="contained" onClick={saveEdit} sx={{ mr: 1 }}>
                      Save
                    </Button>
                    <Button size="small" onClick={() => setEditRow(null)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <IconButton onClick={() => startEdit(b)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(b._id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
