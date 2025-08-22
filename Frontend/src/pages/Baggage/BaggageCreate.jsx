import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  MenuItem,
  Divider
} from "@mui/material";
import * as api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import BaggageList from "./BaggageList";

export default function BaggageCreate({ onCreated }) {
  const { token, user } = useAuth();
  const [flights, setFlights] = useState([]);
  const [form, setForm] = useState({
    tagId: "",
    flightId: "",
    weight: "",
    status: "checkin",
    lastLocation: "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const canCreateBaggage = ["admin", "baggage"].includes(user?.role);
  if (!canCreateBaggage) return null; // hide form if not allowed

  const loadFlights = async () => {
    try {
      const data = await api.listFlights(token);
      setFlights(data);
    } catch {
      setFlights([]);
    }
  };

  useEffect(() => {
    loadFlights();
  }, []);

  useEffect(() => {
    if (flights.length > 0 && !form.flightId) {
      setForm((prev) => ({ ...prev, flightId: flights[0]._id }));
    }
  }, [flights]);

  const submit = async () => {
    setMsg("");
    setErr("");
    try {
      await api.createBaggage(
        { ...form, weight: form.weight ? Number(form.weight) : undefined },
        token
      );
      setMsg("Baggage created / assigned");
      setForm({
        tagId: "",
        flightId: flights.length > 0 ? flights[0]._id : "",
        weight: "",
        status: "checkin",
        lastLocation: "",
      });
      if (onCreated) onCreated();
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to create baggage");
    }
  };

  const statusOptions = [
    { value: "checkin", label: "Check-in" },
    { value: "loaded", label: "Loaded" },
    { value: "inTransit", label: "In Transit" },
    { value: "unloaded", label: "Unloaded" },
    { value: "atBelt", label: "At Belt" },
    { value: "lost", label: "Lost" },
  ];

  return (
    <Card sx={{ maxWidth: 1112, mx: "auto", borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Add Baggage
        </Typography>

        {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tag ID"
              value={form.tagId}
              onChange={(e) => setForm({ ...form, tagId: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Flight"
              value={form.flightId}
              onChange={(e) => setForm({ ...form, flightId: e.target.value })}
              InputLabelProps={{ shrink: true }}
              SelectProps={{
                renderValue: (selected) => {
                  if (!selected) return "Add Flight";
                  const flight = flights.find((f) => f._id === selected);
                  return flight ? `${flight.flightNo} — ${flight.origin}→${flight.destination}` : "Add Flight";
                },
              }}
            >
              {flights.map((f) => (
                <MenuItem key={f._id} value={f._id}>
                  {f.flightNo} — {f.origin}→{f.destination}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Weight (kg)"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {statusOptions.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Last Location"
              value={form.lastLocation}
              onChange={(e) => setForm({ ...form, lastLocation: e.target.value })}
            />
          </Grid>
        </Grid>

        <Button
          sx={{ mt: 4 }}
          variant="contained"
          onClick={submit}
          disabled={!form.tagId || (!form.flightId && flights.length === 0)}
        >
          Save
        </Button>
        <Divider sx={{ my: 4 }} />
        
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Baggages
              </Typography>
              <BaggageList />
      </CardContent>
    </Card>
  );
}
