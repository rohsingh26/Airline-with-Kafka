import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import * as api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const statusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "boarding", label: "Boarding" },
  { value: "departed", label: "Departed" },
  { value: "arrived", label: "Arrived" },
  { value: "delayed", label: "Delayed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function FlightsList({ embedded = false }) {
  const { token, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [patch, setPatch] = useState({ gate: "", status: "" });

  const canEdit = user?.role === "admin" || user?.role === "airline";
  const canDelete = user?.role === "admin";

  const load = async () => {
    const data = await api.listFlights(token);
    setRows(data);
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  const startEdit = (r) => {
    setEditRow(r);
    setPatch({ gate: r.gate || "", status: r.status || "scheduled" });
  };

  const save = async () => {
    await api.updateFlight(editRow._id, patch, token);
    setEditRow(null);
    await load();
  };

  const remove = async (r) => {
    if (!confirm(`Delete flight ${r.flightNo}?`)) return;
    await api.deleteFlight(r._id, token);
    await load();
  };

  const getRowStyle = (status) => {
    if (status === "cancelled") {
      return { backgroundColor: "#e76464ff" }; // light red background
    }
    if (status === "delayed") {
      return { border: "2px solid red" }; // red border
    }
    return {};
  };

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table size={embedded ? "small" : "medium"}>
        <TableHead>
          <TableRow>
            <TableCell>Flight No</TableCell>
            <TableCell>Route</TableCell>
            <TableCell>Gate</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Sched Dep</TableCell>
            <TableCell>Sched Arr</TableCell>
            {canEdit && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r._id} sx={getRowStyle(r.status)}>
              <TableCell>{r.flightNo}</TableCell>
              <TableCell>
                {r.origin} → {r.destination}
              </TableCell>
              <TableCell>
                {editRow?._id === r._id ? (
                  <TextField
                    size="small"
                    value={patch.gate}
                    onChange={(e) =>
                      setPatch({ ...patch, gate: e.target.value })
                    }
                  />
                ) : (
                  r.gate || "—"
                )}
              </TableCell>
              <TableCell>
                {editRow?._id === r._id ? (
                  <TextField
                    select
                    size="small"
                    value={patch.status}
                    onChange={(e) =>
                      setPatch({ ...patch, status: e.target.value })
                    }
                  >
                    {statusOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  r.status
                )}
              </TableCell>
              <TableCell>
                {r.scheduledDep
                  ? new Date(r.scheduledDep).toLocaleString()
                  : "—"}
              </TableCell>
              <TableCell>
                {r.scheduledArr
                  ? new Date(r.scheduledArr).toLocaleString()
                  : "—"}
              </TableCell>

              {canEdit && (
                <TableCell align="right">
                  {editRow?._id === r._id ? (
                    <>
                      <Button
                        onClick={save}
                        size="small"
                        variant="contained"
                        sx={{ mr: 1 }}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditRow(null)}
                        size="small"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => startEdit(r)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {canDelete && (
                        <Tooltip title="Delete">
                          <IconButton onClick={() => remove(r)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
