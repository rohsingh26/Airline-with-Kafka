import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Chip,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../services/api";

const statusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "boarding", label: "Boarding" },
  { value: "departed", label: "Departed" },
  { value: "arrived", label: "Arrived" },
  { value: "delayed", label: "Delayed" },
  { value: "cancelled", label: "Cancelled" },
];

const statusColors = {
  scheduled: { bg: "#e3f2fd", color: "#1565c0" },
  boarding: { bg: "#fff3e0", color: "#ef6c00" },
  departed: { bg: "#e8f5e9", color: "#2e7d32" },
  arrived: { bg: "#ede7f6", color: "#4527a0" },
  delayed: { bg: "#fff3e0", color: "#ef6c00" },
  cancelled: { bg: "#ffebee", color: "#c62828" },
};

export default function FlightsList() {
  const { token, user } = useAuth();
  const [flights, setFlights] = useState([]);
  const [err, setErr] = useState("");
  const [editFlight, setEditFlight] = useState(null);
  const [patch, setPatch] = useState({ status: "", gate: "" });

  const canEdit = ["admin", "airline"].includes(user?.role);

  const loadFlights = async () => {
    try {
      const data = await api.listFlights(token);
      setFlights(data);
    } catch {
      setErr("Failed to load flights");
    }
  };

  useEffect(() => { loadFlights(); }, []);

  const startEdit = (f) => {
    if (!canEdit) return;
    setEditFlight(f._id);
    setPatch({ status: f.status, gate: f.gate || "" });
  };

  const saveEdit = async () => {
    try {
      await api.updateFlight(editFlight, patch, token);
      setEditFlight(null);
      await loadFlights();
    } catch {
      alert("Failed to update flight");
    }
  };

  const handleDelete = async (id) => {
    if (!canEdit) return;
    if (!window.confirm("Delete this flight?")) return;
    try {
      await api.deleteFlight(id, token);
      setFlights((prev) => prev.filter((f) => f._id !== id));
    } catch {
      alert("Failed to delete flight");
    }
  };

  if (err) return <Alert severity="error">{err}</Alert>;
  if (!flights.length) return <Alert severity="info">No flights found.</Alert>;

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#af9233ff' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Flight No</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Origin → Destination</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Scheduled Departure</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Scheduled Arrival</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Gate</TableCell>
                {canEdit && <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }} align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {flights.map((f, idx) => (
                <TableRow key={f._id} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fafafa" } }}>
                  <TableCell>{f.flightNo}</TableCell>
                  <TableCell>{f.origin} → {f.destination}</TableCell>
                  <TableCell>{new Date(f.scheduledDep).toLocaleString()}</TableCell>
                  <TableCell>{new Date(f.scheduledArr).toLocaleString()}</TableCell>
                  <TableCell>
                    {editFlight === f._id ? (
                      <TextField
                        size="small"
                        select
                        value={patch.status}
                        onChange={(e) => setPatch({ ...patch, status: e.target.value })}
                      >
                        {statusOptions.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                      </TextField>
                    ) : (
                      <Chip
                        label={statusOptions.find(s => s.value === f.status)?.label || f.status}
                        sx={{ backgroundColor: statusColors[f.status]?.bg, color: statusColors[f.status]?.color, fontWeight: 600, borderRadius: "8px" }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {editFlight === f._id ? (
                      <TextField
                        size="small"
                        value={patch.gate}
                        onChange={(e) => setPatch({ ...patch, gate: e.target.value })}
                      />
                    ) : f.gate || "-"}
                  </TableCell>
                  {canEdit && (
                    <TableCell align="center">
                      {editFlight === f._id ? (
                        <>
                          <Button size="small" variant="contained" onClick={saveEdit} sx={{ mr: 1 }}>Save</Button>
                          <Button size="small" onClick={() => setEditFlight(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <IconButton onClick={() => startEdit(f)}><EditIcon /></IconButton>
                          <IconButton onClick={() => handleDelete(f._id)}><DeleteIcon color="error" /></IconButton>
                        </>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
