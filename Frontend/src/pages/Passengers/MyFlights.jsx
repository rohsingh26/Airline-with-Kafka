import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../services/api";

export default function MyFlights() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);

  const load = async () => {
    const data = await api.myFlights(token); // if backend route missing, it returns []
    setRows(data || []);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>My Flights</Typography>
        {(!rows || rows.length === 0) ? (
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            No passenger flights found. (Implement /passengers/checkin & /passengers/my-flights to use this view.)
          </Typography>
        ) : (
          rows.map((r) => (
            <Typography key={r._id}>
              {r.flightId?.flightNo} — {r.flightId?.origin} → {r.flightId?.destination}
            </Typography>
          ))
        )}
      </CardContent>
    </Card>
  );
}
