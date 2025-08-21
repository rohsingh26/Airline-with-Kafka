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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import * as api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function BaggageList({ embedded = false }) {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

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

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

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
            <TableCell>Weight</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Location</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((b) => (
            <TableRow key={b._id}>
              <TableCell>{b.tagId}</TableCell>
              <TableCell>{b.flightId?.flightNo}</TableCell>
              <TableCell>{b.weight ?? "-"}</TableCell>
              <TableCell>{b.status}</TableCell>
              <TableCell>{b.lastLocation ?? "-"}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDelete(b._id)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
