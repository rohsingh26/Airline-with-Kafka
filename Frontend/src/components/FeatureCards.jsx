import React, { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  LabelList,
} from "recharts";
import * as api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const COLORS = ["#2e7d32", "#c62828"]; // efficiency pie colors
const OVERVIEW_COLORS = { Total: "#1565c0", Active: "#2e7d32" };
const ISSUES_COLORS = { Delayed: "#8300efff", Cancelled: "#c62828" };

export default function FeatureCards() {
  const { token } = useAuth();
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.listFlights(token);
        setFlights(data);
      } catch (e) {
        console.error("Failed to load flights", e);
      }
    };
    load();
  }, [token]);

  // --- Metrics ---
  const now = new Date();
  const totalFlights = flights.length;
  const activeFlights = flights.filter(
    (f) => new Date(f.scheduledDep) > now
  ).length;
  const delayedFlights = flights.filter((f) => f.status === "delayed").length;
  const cancelledFlights = flights.filter((f) => f.status === "cancelled").length;

  const issueFlights = delayedFlights + cancelledFlights;
  const efficiency =
    activeFlights > 0 ? (1 - issueFlights / activeFlights) * 100 : 100;

  const pieData = [
    { name: "Efficient", value: efficiency },
    { name: "Issues", value: 100 - efficiency },
  ];

  const flightsOverviewData = [
    { name: "Flights", Total: totalFlights, Active: activeFlights },
  ];

  const issuesData = [
    { name: "Issues", Delayed: delayedFlights, Cancelled: cancelledFlights },
  ];

  return (
    <Grid container spacing={3}>
      {/* Total / Active Flights */}
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            borderRadius: 4,
            p: 2,
            minHeight: 350,
            minWidth: 250,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Flights Overview
            </Typography>
            <Box sx={{ marginLeft: -6, flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={flightsOverviewData} barSize={45}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                  <Legend />
                  <Bar
                    dataKey="Total"
                    fill={OVERVIEW_COLORS.Total}
                    radius={[8, 8, 0, 0]}
                  >
                    <LabelList dataKey="Total" position="top" fill="#333" />
                  </Bar>
                  <Bar
                    dataKey="Active"
                    fill={OVERVIEW_COLORS.Active}
                    radius={[8, 8, 0, 0]}
                  >
                    <LabelList dataKey="Active" position="top" fill="#333" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Flight Issues */}
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            borderRadius: 4,
            p: 2,
            minHeight: 350,
            minWidth: 250,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Flight Issues
            </Typography>
            <Box sx={{ marginLeft: -6, flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={issuesData} barSize={45}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                  <Legend />
                  <Bar
                    dataKey="Delayed"
                    fill={ISSUES_COLORS.Delayed}
                    radius={[8, 8, 0, 0]}
                  >
                    <LabelList dataKey="Delayed" position="top" fill="#333" />
                  </Bar>
                  <Bar
                    dataKey="Cancelled"
                    fill={ISSUES_COLORS.Cancelled}
                    radius={[8, 8, 0, 0]}
                  >
                    <LabelList dataKey="Cancelled" position="top" fill="#333" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Efficiency */}
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            borderRadius: 4,
            p: 2,
            minHeight: 350,
            minWidth: 250,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Operational Efficiency
            </Typography>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Typography
              variant="h5"
              sx={{ mt: 1, fontWeight: 700, color: "#2e7d32", textAlign: "center" }}
            >
              {efficiency.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
              of active flights operating without issues
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
