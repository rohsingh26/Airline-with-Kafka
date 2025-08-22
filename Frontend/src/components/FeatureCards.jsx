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
const EMPLOYEE_COLORS = {
  Total: "#D4AF37",
  Airline: "#1565c0",
  Baggage: "#ef6c00",
};
const BAGGAGE_COLORS = ["#2e7d32", "#c62828"]; // green = ok, red = lost

export default function FeatureCards() {
  const { token, user } = useAuth();
  const [flights, setFlights] = useState([]);
  const [users, setUsers] = useState([]);
  const [baggage, setBaggage] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const flightData = await api.listFlights(token);
        setFlights(flightData);

        const baggageData = await api.listBaggage(token);
        setBaggage(baggageData);

        if (user?.role === "admin") {
          const usersData = await api.listUsers(token);
          setUsers(usersData);
        }
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      }
    };
    load();
  }, [token, user]);

  // --- Flight Metrics ---
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

  // --- Employee Metrics (admin only) ---
  const airlineStaff = users.filter((u) => u.role === "airline").length;
  const baggageStaff = users.filter((u) => u.role === "baggage").length;
  const totalStaff = airlineStaff + baggageStaff;

  const employeeData = [
    {
      name: "Staff",
      Total: totalStaff,
      Airline: airlineStaff,
      Baggage: baggageStaff,
    },
  ];

  // --- Baggage Metrics ---
  const totalBaggage = baggage.length;
  const lostBaggage = baggage.filter((b) => b.status === "lost").length;
  const okBaggage = totalBaggage - lostBaggage;

  const baggageData = [
    { name: "Safe", value: okBaggage },
    { name: "Lost", value: lostBaggage },
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
            <Box
              sx={{
                marginLeft: -6,
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
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
            <Box
              sx={{
                marginLeft: -6,
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
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
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
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
              sx={{
                mt: 1,
                fontWeight: 700,
                color: "#2e7d32",
                textAlign: "center",
              }}
            >
              {efficiency.toFixed(1)}%
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              of active flights operating without issues
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Baggage Pie Chart */}
      <Grid item xs={12} md={6}>
        <Card
            sx={{
            borderRadius: 4,
            p: 2,
            minHeight: 350,
            minWidth: 300,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
        >
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Baggage Status
            </Typography>
            <Box
                sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                }}
            >
                <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                    data={baggageData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    >
                    {baggageData.map((entry, index) => (
                        <Cell
                        key={`cell-${index}`}
                        fill={BAGGAGE_COLORS[index % BAGGAGE_COLORS.length]}
                        />
                    ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>
            </Box>
            <Typography
                variant="h6"
                sx={{ mt: 1, fontWeight: 600, textAlign: "center" }}
            >
                {lostBaggage} Lost / {totalBaggage} Total
            </Typography>
            </CardContent>
        </Card>
      </Grid>

      {/* Employee Details (Admin only) */}
      {user?.role === "admin" && (
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 4,
              p: 2,
              minHeight: 350,
              minWidth: 300,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Employee Details
              </Typography>
              <Box
                sx={{
                  marginLeft: -6,
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={employeeData} barSize={45}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                    <Legend />
                    <Bar
                      dataKey="Total"
                      fill={EMPLOYEE_COLORS.Total}
                      radius={[8, 8, 0, 0]}
                    >
                      <LabelList dataKey="Total" position="top" fill="#333" />
                    </Bar>
                    <Bar
                      dataKey="Airline"
                      fill={EMPLOYEE_COLORS.Airline}
                      radius={[8, 8, 0, 0]}
                    >
                      <LabelList dataKey="Airline" position="top" fill="#333" />
                    </Bar>
                    <Bar
                      dataKey="Baggage"
                      fill={EMPLOYEE_COLORS.Baggage}
                      radius={[8, 8, 0, 0]}
                    >
                      <LabelList dataKey="Baggage" position="top" fill="#333" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}
