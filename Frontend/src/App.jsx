import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import FlightsPage from "./pages/Flights/FlightsPage";   // ✅ Import FlightsPage
import FlightCreate from "./pages/Flights/FlightCreate";
import FlightSearch from "./pages/Flights/FlightSearch";
import FlightsList from "./pages/Flights/FlightsList";
import BaggageList from "./pages/Baggage/BaggageList";
import BaggageCreate from "./pages/Baggage/BaggageCreate";
import MyFlights from "./pages/Passengers/MyFlights";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

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
        <Route path="flights" element={<FlightsPage />} />   {/* ✅ Use FlightsPage here */}
        <Route path="flights/create" element={<FlightCreate />} />
        <Route path="flights/search" element={<FlightSearch />} />
        <Route path="flights/list" element={<FlightsList />} />

        {/* Baggage */}
        <Route path="baggage" element={<BaggageList />} />
        <Route path="baggage/create" element={<BaggageCreate />} />

        {/* Passenger */}
        <Route path="my-flights" element={<MyFlights />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
