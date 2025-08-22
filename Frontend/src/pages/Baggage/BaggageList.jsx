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
  Chip,
  Card,
  CardContent,
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

  const statusColors = {
    checkin: { bg: "#e3f2fd", color: "#1565c0" },
    loaded: { bg: "#e8f5e9", color: "#2e7d32" },
    inTransit: { bg: "#fff3e0", color: "#ef6c00" },
    unloaded: { bg: "#ede7f6", color: "#4527a0" },
    atBelt: { bg: "#e0f7fa", color: "#00838f" },
    lost: { bg: "#ffebee", color: "#c62828" },
  };

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
    <Card sx={{ borderRadius: 3, boxShadow: 3,}}>
      <CardContent>
        <Table
          size="small"
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            overflow: "hidden",
            "& th": {
              backgroundColor: "#f5f5f5",
              fontWeight: 700,
            },
            "& tr:nth-of-type(odd)": {
              backgroundColor: "#fafafa",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Tag ID</TableCell>
              <TableCell>Flight</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Location</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((b) => (
              <TableRow key={b._id}>
                <TableCell>{b.tagId}</TableCell>
                <TableCell>{b.flightId?.flightNo}</TableCell>

                <TableCell>
                  {editRow === b._id ? (
                    <TextField
                      size="small"
                      select
                      value={patch.status}
                      onChange={(e) =>
                        setPatch({ ...patch, status: e.target.value })
                      }
                    >
                      {statusOptions.map((s) => (
                        <MenuItem key={s.value} value={s.value}>
                          {s.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <Chip
                      label={
                        statusOptions.find((s) => s.value === b.status)?.label ||
                        b.status
                      }
                      sx={{
                        backgroundColor: statusColors[b.status]?.bg,
                        color: statusColors[b.status]?.color,
                        fontWeight: 600,
                        borderRadius: "8px",
                      }}
                    />
                  )}
                </TableCell>

                <TableCell>
                  {editRow === b._id ? (
                    <TextField
                      size="small"
                      value={patch.lastLocation}
                      onChange={(e) =>
                        setPatch({ ...patch, lastLocation: e.target.value })
                      }
                    />
                  ) : (
                    b.lastLocation ?? "-"
                  )}
                </TableCell>

                <TableCell align="center">
                  {editRow === b._id ? (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={saveEdit}
                        sx={{ mr: 1 }}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setEditRow(null)}
                      >
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
      </CardContent>
    </Card>
  );
}
