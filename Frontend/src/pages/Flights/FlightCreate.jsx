import React, { useEffect, useState } from "react";
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
  Divider
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../services/api";
import { useNavigate } from "react-router-dom";
import FlightsList from "./FlightsList";

const statusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "boarding", label: "Boarding" },
  { value: "departed", label: "Departed" },
  { value: "arrived", label: "Arrived" },
  { value: "delayed", label: "Delayed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function FlightCreate() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    flightNo: "",
    airlineCode: "",
    origin: "",
    destination: "",
    gate: "",
    scheduledDep: "",
    scheduledArr: "",
    status: "scheduled",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const canCreate = ["admin", "airline"].includes(user?.role);

  useEffect(() => {
    if (!canCreate) navigate("/"); // redirect unauthorized users
  }, [canCreate, navigate]);

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
    <Card sx={{ mx: "auto", borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Create Flight
        </Typography>

        {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Flight No"
              value={form.flightNo}
              onChange={(e) => setForm({ ...form, flightNo: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Airline Code"
              value={form.airlineCode}
              onChange={(e) => setForm({ ...form, airlineCode: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Origin (IATA)"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Destination (IATA)"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Gate"
              value={form.gate}
              onChange={(e) => setForm({ ...form, gate: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Scheduled Departure"
              InputLabelProps={{ shrink: true }}
              value={form.scheduledDep}
              onChange={(e) => setForm({ ...form, scheduledDep: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Scheduled Arrival"
              InputLabelProps={{ shrink: true }}
              value={form.scheduledArr}
              onChange={(e) => setForm({ ...form, scheduledArr: e.target.value })}
              required
            />
          </Grid>

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
              !canCreate ||
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
            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                All Flights
            </Typography>
            <FlightsList />
        </Box>
      </CardContent>
    </Card>
  );
}
