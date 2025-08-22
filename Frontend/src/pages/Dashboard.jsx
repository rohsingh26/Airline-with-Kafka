import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
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
      <Box>
        <FeatureCards />
      </Box>

      {/* Role-based sections */}
      <Box sx={{ mt: 3 }}>
        {/* Flights List: visible for admin, airline, and passengers */}
        {(user?.role === "admin" || user?.role === "airline" || user?.role === "passenger") && (
          <Card sx={{ borderRadius: 3, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Flights List
              </Typography>
              <FlightsList embedded />
            </CardContent>
          </Card>
        )}

        {/* Baggage List: visible for admin, baggage staff, and passengers */}
        {(user?.role === "admin" || user?.role === "baggage" || user?.role === "passenger") && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Baggage List
              </Typography>
              <BaggageList embedded />
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
