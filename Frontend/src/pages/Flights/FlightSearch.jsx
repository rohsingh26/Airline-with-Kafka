import React, { useState } from "react";
import { Box, TextField, Button, Grid, Card, CardContent, Typography, Alert } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../services/api";

export default function FlightSearch({ compact = false }) {
  const { token } = useAuth();
  const [flightNo, setFlightNo] = useState("");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  const onSearch = async () => {
    setErr(""); 
    setResult(null);
    try {
      const data = await api.searchFlightByNo(flightNo.trim(), token);
      setResult(data);
    } catch (e) {
      setErr(e?.response?.data?.error || "Flight not found");
    }
  };

  const onClear = () => {
    setFlightNo("");
    setResult(null);
    setErr("");
  };

  return (
    <Box>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12} md={compact ? 7 : 5}>
          <TextField
            fullWidth
            label="Flight Number (e.g., AI203)"
            value={flightNo}
            onChange={(e) => setFlightNo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
        </Grid>
        <Grid item xs={6} md={compact ? 3 : 2}>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={onSearch} 
            disabled={!flightNo.trim()}
          >
            Search
          </Button>
        </Grid>
        <Grid item xs={6} md={compact ? 2 : 2}>
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={onClear} 
            disabled={!flightNo && !result && !err}
          >
            Clear
          </Button>
        </Grid>
      </Grid>

      {err && <Alert severity="error" sx={{ mt: 2 }}>{err}</Alert>}

      {result && (
        <Card sx={{ mt: 2, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {result.flightNo} — {result.origin} → {result.destination}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Gate: {result.gate || "TBD"} | Status: {result.status}
            </Typography>
            {result.scheduledDep && (
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Departs: {new Date(result.scheduledDep).toLocaleString()}
              </Typography>
            )}
            {result.scheduledArr && (
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Arrives: {new Date(result.scheduledArr).toLocaleString()}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
