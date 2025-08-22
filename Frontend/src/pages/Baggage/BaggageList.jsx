import React, { useEffect, useState } from "react";
import {
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
  Typography,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../services/api";

const statusOptions = [
  { value: "checkin", label: "Check-in" },
  { value: "loaded", label: "Loaded" },
  { value: "inTransit", label: "In Transit" },
  { value: "unloaded", label: "Unloaded" },
  { value: "atBelt", label: "At Belt" },
  { value: "lost", label: "Lost" },
];

const statusColors = {
  checkin: { bg: "#e3f2fd", color: "#1565c0" },
  loaded: { bg: "#e8f5e9", color: "#2e7d32" },
  inTransit: { bg: "#fff3e0", color: "#ef6c00" },
  unloaded: { bg: "#ede7f6", color: "#4527a0" },
  atBelt: { bg: "#e0f7fa", color: "#00838f" },
  lost: { bg: "#ffebee", color: "#c62828" },
};

export default function BaggageList() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [patch, setPatch] = useState({ status: "", lastLocation: "" });

  const canEdit = ["admin", "baggage"].includes(user?.role);

  const loadBaggage = async () => {
    try {
      const data = await api.listBaggage(token);
      setRows(data);
    } catch {
      setErr("Failed to load baggage");
    }
  };

  useEffect(() => { loadBaggage(); }, []);

  const startEdit = (row) => {
    if (!canEdit) return;
    setEditRow(row._id);
    setPatch({ status: row.status || "", lastLocation: row.lastLocation || "" });
  };

  const saveEdit = async () => {
    try {
      await api.updateBaggage(editRow, patch, token);
      setEditRow(null);
      await loadBaggage();
    } catch {
      alert("Failed to update baggage");
    }
  };

  const handleDelete = async (id) => {
    if (!canEdit) return;
    if (!window.confirm("Delete this baggage?")) return;
    try {
      await api.deleteBaggage(id, token);
      setRows((prev) => prev.filter((r) => r._id !== id));
    } catch {
      alert("Failed to delete baggage");
    }
  };

  if (err) return <Alert severity="error">{err}</Alert>;
  if (!rows.length) return <Alert severity="info">No baggage found.</Alert>;

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#af9233ff' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Tag ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Flight</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Last Location</TableCell>
                {canEdit && <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }} align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((b, idx) => (
                <TableRow key={b._id} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fafafa" } }}>
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
                        {statusOptions.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                      </TextField>
                    ) : (
                      <Chip
                        label={statusOptions.find(s => s.value === b.status)?.label || b.status}
                        sx={{ backgroundColor: statusColors[b.status]?.bg, color: statusColors[b.status]?.color, fontWeight: 600, borderRadius: "8px" }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {editRow === b._id ? (
                      <TextField
                        size="small"
                        value={patch.lastLocation}
                        onChange={(e) => setPatch({ ...patch, lastLocation: e.target.value })}
                      />
                    ) : b.lastLocation || "-"}
                  </TableCell>
                  {canEdit && (
                    <TableCell align="center">
                      {editRow === b._id ? (
                        <>
                          <Button size="small" variant="contained" onClick={saveEdit} sx={{ mr: 1 }}>Save</Button>
                          <Button size="small" onClick={() => setEditRow(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <IconButton onClick={() => startEdit(b)}><EditIcon /></IconButton>
                          <IconButton onClick={() => handleDelete(b._id)}><DeleteIcon color="error" /></IconButton>
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
