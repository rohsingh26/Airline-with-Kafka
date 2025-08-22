import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Button,
  Alert,
  MenuItem,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../services/api";
import { useNavigate } from "react-router-dom";

const statusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "boarding", label: "Boarding" },
  { value: "departed", label: "Departed" },
  { value: "arrived", label: "Arrived" },
  { value: "delayed", label: "Delayed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function FlightCreate() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    flightNo: "",
    airlineCode: "", // required
    origin: "",
    destination: "",
    gate: "",
    scheduledDep: "",
    scheduledArr: "",
    status: "scheduled", // default
  });

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    setMsg("");
    setErr("");
    try {
      await api.createFlight(form, token);
      setMsg("Flight created successfully");
      setTimeout(() => navigate("/flights"), 800);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to create flight");
    }
  };

  return (
    <Card sx={{ maxWidth: 1212, mx: "auto", borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Create Flight
        </Typography>

        {msg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {msg}
          </Alert>
        )}
        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Flight No */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Flight No"
              value={form.flightNo}
              onChange={(e) => setForm({ ...form, flightNo: e.target.value })}
              required
            />
          </Grid>

          {/* Airline Code */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Airline Code"
              value={form.airlineCode}
              onChange={(e) =>
                setForm({ ...form, airlineCode: e.target.value })
              }
              required
            />
          </Grid>

          {/* Origin */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Origin (IATA)"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              required
            />
          </Grid>

          {/* Destination */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Destination (IATA)"
              value={form.destination}
              onChange={(e) =>
                setForm({ ...form, destination: e.target.value })
              }
              required
            />
          </Grid>

          {/* Gate */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Gate"
              value={form.gate}
              onChange={(e) => setForm({ ...form, gate: e.target.value })}
            />
          </Grid>

          {/* Scheduled Departure */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Scheduled Departure"
              InputLabelProps={{ shrink: true }}
              value={form.scheduledDep}
              onChange={(e) =>
                setForm({ ...form, scheduledDep: e.target.value })
              }
              required
            />
          </Grid>

          {/* Scheduled Arrival */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Scheduled Arrival"
              InputLabelProps={{ shrink: true }}
              value={form.scheduledArr}
              onChange={(e) =>
                setForm({ ...form, scheduledArr: e.target.value })
              }
              required
            />
          </Grid>

          {/* Status - dropdown */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: "left" }}>
          <Button
            variant="contained"
            onClick={submit}
            disabled={
              !form.flightNo ||
              !form.airlineCode ||
              !form.origin ||
              !form.destination ||
              !form.scheduledDep ||
              !form.scheduledArr
            }
          >
            Create
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
