import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import FlightSearch from "./FlightSearch";
import FlightsList from "./FlightsList";

export default function FlightsPage() {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Flight Search
      </Typography>
      <FlightSearch />

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        All Flights
      </Typography>
      <FlightsList />
    </Box>
  );
}
