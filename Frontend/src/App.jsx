import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import FlightsPage from "./pages/Flights/FlightsPage";
import FlightCreate from "./pages/Flights/FlightCreate";
import FlightSearch from "./pages/Flights/FlightSearch";
import FlightsList from "./pages/Flights/FlightsList";
import BaggageList from "./pages/Baggage/BaggageList";
import BaggageCreate from "./pages/Baggage/BaggageCreate";
import MyFlights from "./pages/Passengers/MyFlights";
import AddUsers from "./pages/Admin/AddUsers"; 
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { Typography } from "@mui/material";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Flights */}
        <Route
          path="flights"
          element={
            <ProtectedRoute roles={["admin", "airline", "baggage", "passenger"]}>
              <FlightsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="flights/create"
          element={
            <ProtectedRoute roles={["admin", "airline"]}>
              <FlightCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="flights/search"
          element={
            <ProtectedRoute roles={["admin", "airline","baggage", "passenger"]}>
              <FlightSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="flights/list"
          element={
            <ProtectedRoute roles={["admin", "airline", "baggage", "passenger"]}>
              <FlightsList />
            </ProtectedRoute>
          }
        />

        {/* Baggage */}
        <Route
          path="baggage"
          element={
            <ProtectedRoute roles={["admin", "airline", "baggage", "passenger"]}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, ml:1 }}>
                Baggages
              </Typography>
              <BaggageList />
            </ProtectedRoute>
          }
        />
        <Route
          path="baggage/create"
          element={
            <ProtectedRoute roles={["admin", "baggage"]}>
              <BaggageCreate />
            </ProtectedRoute>
          }
        />

        {/* Passenger */}
        <Route
          path="my-flights"
          element={
            <ProtectedRoute roles={["passenger"]}>
              <MyFlights />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="admin/add-users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AddUsers />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
