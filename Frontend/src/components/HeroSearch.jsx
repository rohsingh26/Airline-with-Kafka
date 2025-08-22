import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import FlightSearch from "../pages/Flights/FlightSearch";
import bgImage from "../assets/p1.avif";

export default function HeroSearch() {
  return (
    <Box
      sx={{
        position: "relative",
        height: 350,
        borderRadius: 3,
        overflow: "hidden",
        mb: 4,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          bgcolor: "rgba(0,0,0,0.4)",
        }}
      />

      {/* Centered Content */}
      <Box sx={{ position: "relative", textAlign: "center", color: "#fff", px: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, mb: 2 }}>
          Discover Your Next Adventure
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3 }}>
          Book flights to your dream destination with Airline.
        </Typography>

        {/* Search box */}
        <Paper
          elevation={4}
          sx={{
            maxWidth: 450,
            minWidth:100,
            mx: "auto",
            p: 2,
            borderRadius: 3,
          }}
        >
          <FlightSearch />
        </Paper>
      </Box>
    </Box>
  );
}
