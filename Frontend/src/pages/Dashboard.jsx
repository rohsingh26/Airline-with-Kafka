import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import FlightsList from "./Flights/FlightsList";
import BaggageList from "./Baggage/BaggageList";
import HeroSearch from "../components/HeroSearch";
import FeatureCards from "../components/FeatureCards";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Box>
      {/* Hero Section with Banner */}
      <HeroSearch />

      {/* Why Choose Section */}
      <Box sx={{ my: 5 }}>
        <FeatureCards />
      </Box>

      {/* Role-based sections */}
      <Box sx={{ mt: 3 }}>
        {(user?.role === "admin" || user?.role === "airline" || user?.role === "baggage") && (
          <Card sx={{ borderRadius: 3, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Active Flights
              </Typography>
              <FlightsList embedded />
            </CardContent>
          </Card>
        )}

        {(user?.role === "admin" || user?.role === "baggage" || user?.role === "airline") && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Baggage (Recent)
              </Typography>
              <BaggageList embedded />
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
