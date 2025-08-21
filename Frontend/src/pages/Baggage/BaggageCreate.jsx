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
} from "@mui/material";
import * as api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function BaggageCreate({ onCreated }) {
  const { token } = useAuth();
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
  }, []); // eslint-disable-line

  const submit = async () => {
    setMsg("");
    setErr("");
    try {
      await api.createBaggage(
        {
          ...form,
          weight: form.weight ? Number(form.weight) : undefined,
        },
        token
      );
      setMsg("Baggage created / assigned");
      setForm({
        tagId: "",
        flightId: "",
        weight: "",
        status: "checkin",
        lastLocation: "",
      });
      if (onCreated) onCreated();
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to create baggage");
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: "auto", borderRadius: 3 }}>
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
              fullWidth
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              placeholder="checkin|loaded|inTransit|unloaded|atBelt|lost"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Last Location"
              value={form.lastLocation}
              onChange={(e) =>
                setForm({ ...form, lastLocation: e.target.value })
              }
            />
          </Grid>
        </Grid>

        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={submit}
          disabled={!form.tagId || !form.flightId}
        >
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
