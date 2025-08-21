import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Button,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import WorkIcon from "@mui/icons-material/Work";
import SearchIcon from "@mui/icons-material/Search";
import LuggageIcon from "@mui/icons-material/Luggage";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../context/AuthContext";
import ProfileDialog from "./ProfileDialog";

export default function Layout() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openProfile, setOpenProfile] = React.useState(false);
  const open = Boolean(anchorEl);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { to: "/", label: "Dashboard", icon: <DashboardIcon /> },
    { to: "/flights", label: "Flights", icon: <FlightTakeoffIcon /> },
    { to: "/flights/search", label: "Search Flight", icon: <SearchIcon /> },
    { to: "/baggage", label: "Baggage", icon: <LuggageIcon /> },
  ];

  const canCreateFlight = user?.role === "admin" || user?.role === "airline";
  const canCreateBaggage = ["admin", "airline", "baggage"].includes(user?.role);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f7fb" }}>
      <AppBar
        position="sticky"
        elevation={1}
        sx={{ bgcolor: "#1A1A2E", color: "#fff" }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#D4AF37" }}>
            Airline
          </Typography>

          {/* Navbar Menu */}
          <Box sx={{ display: "flex", gap: 2 }}>
            {menuItems.map((m) => (
              <Button
                key={m.to}
                component={Link}
                to={m.to}
                startIcon={m.icon}
                sx={{
                  color: location.pathname === m.to ? "#D4AF37" : "#fff",
                  fontWeight: 600,
                  "&:hover": { color: "#D4AF37" },
                }}
              >
                {m.label}
              </Button>
            ))}

            {canCreateFlight && (
              <Button
                component={Link}
                to="/flights/create"
                startIcon={<AddIcon />}
                sx={{
                  color: "#D4AF37",
                  fontWeight: 600,
                  "&:hover": { color: "#fff", bgcolor: "rgba(212,175,55,0.1)" },
                }}
              >
                New Flight
              </Button>
            )}

            {canCreateBaggage && (
              <Button
                component={Link}
                to="/baggage/create"
                startIcon={<WorkIcon />}
                sx={{
                  color: "#D4AF37",
                  fontWeight: 600,
                  "&:hover": { color: "#fff", bgcolor: "rgba(212,175,55,0.1)" },
                }}
              >
                Add Baggage
              </Button>
            )}
          </Box>

          {/* Profile Menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "#fff" }}>
              {user?.name}
            </Typography>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar
                sx={{ bgcolor: "#D4AF37", color: "#1A1A2E", fontWeight: 700 }}
              >
                {user?.name?.[0]?.toUpperCase() || "U"}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              PaperProps={{
                sx: {
                  bgcolor: "#1A1A2E",
                  color: "#fff",
                  "& .MuiMenuItem-root": {
                    "&:hover": { bgcolor: "rgba(212,175,55,0.1)", color: "#D4AF37" },
                  },
                },
              }}
            >
              {/* Show user email + role */}
              <MenuItem disabled>
                <Box>
                  <Typography variant="body2">{user?.email}</Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#D4AF37", fontWeight: 600 }}
                  >
                    {user?.role?.toUpperCase()}
                  </Typography>
                </Box>
              </MenuItem>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

              <MenuItem
                onClick={() => {
                  setOpenProfile(true);
                  setAnchorEl(null);
                }}
              >
                <EditIcon fontSize="small" style={{ marginRight: 8 }} /> Edit Profile
              </MenuItem>

              {user?.role === "passenger" && (
                <MenuItem
                  onClick={() => {
                    navigate("/my-flights");
                    setAnchorEl(null);
                  }}
                >
                  <FlightTakeoffIcon fontSize="small" style={{ marginRight: 8 }} />
                  My Flights
                </MenuItem>
              )}

              <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

              <MenuItem
                onClick={() => logout()}
                sx={{ color: "#ff4d4d", fontWeight: 600 }}
              >
                <LogoutIcon fontSize="small" style={{ marginRight: 8 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>

      {/* Pass role to ProfileDialog */}
      <ProfileDialog
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        user={user}
      />
    </Box>
  );
}
