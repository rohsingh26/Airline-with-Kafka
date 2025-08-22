import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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

export default function FlightsList({ embedded = false }) {
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

  useEffect(() => {
    loadFlights();
  }, []);

  const startEdit = (flight) => {
    if (!canEdit) return;
    setEditFlight(flight._id);
    setPatch({ status: flight.status, gate: flight.gate || "" });
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
  if (flights.length === 0)
    return <Alert severity="info">No flights found.</Alert>;

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Table size="small" sx={{ "& th": { fontWeight: 700 }, "& tr:nth-of-type(odd)": { backgroundColor: "#fafafa" } }}>
          <TableHead>
            <TableRow>
              <TableCell>Flight No</TableCell>
              <TableCell>Origin → Destination</TableCell>
              <TableCell>Gate</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flights.map((f) => (
              <TableRow key={f._id}>
                <TableCell>{f.flightNo}</TableCell>
                <TableCell>{f.origin} → {f.destination}</TableCell>

                <TableCell>
                  {editFlight === f._id ? (
                    <TextField
                      size="small"
                      value={patch.gate}
                      onChange={(e) => setPatch({ ...patch, gate: e.target.value })}
                    />
                  ) : (
                    f.gate || "-"
                  )}
                </TableCell>

                <TableCell>
                  {editFlight === f._id ? (
                    <TextField
                      size="small"
                      select
                      value={patch.status}
                      onChange={(e) => setPatch({ ...patch, status: e.target.value })}
                    >
                      {statusOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <Chip
                      label={statusOptions.find((s) => s.value === f.status)?.label || f.status}
                      sx={{ backgroundColor: statusColors[f.status]?.bg, color: statusColors[f.status]?.color, fontWeight: 600, borderRadius: "8px" }}
                    />
                  )}
                </TableCell>

                <TableCell align="center">
                  {editFlight === f._id ? (
                    <>
                      <Button size="small" variant="contained" onClick={saveEdit} sx={{ mr: 1 }}>Save</Button>
                      <Button size="small" onClick={() => setEditFlight(null)}>Cancel</Button>
                    </>
                  ) : (
                    canEdit && (
                      <>
                        <IconButton onClick={() => startEdit(f)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDelete(f._id)}><DeleteIcon color="error" /></IconButton>
                      </>
                    )
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
