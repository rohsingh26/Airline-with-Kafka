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
  useMediaQuery,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import WorkIcon from "@mui/icons-material/Luggage";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications"; // <-- NEW IMPORT
import { useAuth } from "../context/AuthContext";
import ProfileDialog from "./ProfileDialog";
import FlightNotification from "./FlightNotificationModal";
import NotificationBellModal from "./NotificationBellModal"; // <-- NEW IMPORT

export default function Layout() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [openProfile, setOpenProfile] = React.useState(false);
  const [openNotifications, setOpenNotifications] = React.useState(false); // <-- NEW STATE
  const open = Boolean(anchorEl);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:1000px)");
  const isTiny = useMediaQuery("(max-width:500px)");

  const menuItems = [
    { to: "/", label: "Dashboard", icon: <DashboardIcon /> },
    { to: "/flights", label: "Flights", icon: <FlightTakeoffIcon /> },
    { to: "/baggage", label: "Baggage", icon: <WorkIcon /> },
  ];

  const canCreateFlight = ["admin", "airline"].includes(user?.role);
  const canCreateBaggage = ["admin", "baggage"].includes(user?.role);
  const isAdmin = user?.role === "admin";

  return (
    <Box sx={{ minHeight: "100vh", minWidth: 330, bgcolor: "#f6f7fb" }}>
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: "#1A1A2E", color: "#fff" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isMobile && (
              <>
                <IconButton color="inherit" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={() => setMenuAnchor(null)}
                  PaperProps={{
                    sx: {
                      bgcolor: "#1A1A2E",
                      color: "#fff",
                      "& .MuiMenuItem-root": {
                        "&:hover": {
                          bgcolor: "rgba(212,175,55,0.1)",
                          color: "#D4AF37",
                        },
                      },
                    },
                  }}
                >
                  {menuItems.map((m) => (
                    <MenuItem
                      key={m.to}
                      onClick={() => {
                        navigate(m.to);
                        setMenuAnchor(null);
                      }}
                    >
                      {m.icon}
                      <Typography sx={{ ml: 1 }}>{m.label}</Typography>
                    </MenuItem>
                  ))}

                  {canCreateFlight && (
                    <MenuItem
                      onClick={() => {
                        navigate("/flights/create");
                        setMenuAnchor(null);
                      }}
                    >
                      <AddIcon fontSize="small" />
                      <Typography sx={{ ml: 1 }}>New Flight</Typography>
                    </MenuItem>
                  )}

                  {canCreateBaggage && (
                    <MenuItem
                      onClick={() => {
                        navigate("/baggage/create");
                        setMenuAnchor(null);
                      }}
                    >
                      <WorkIcon fontSize="small" />
                      <Typography sx={{ ml: 1 }}>Add Baggage</Typography>
                    </MenuItem>
                  )}

                  {isAdmin && (
                    <MenuItem
                      onClick={() => {
                        navigate("/admin/add-users");
                        setMenuAnchor(null);
                      }}
                    >
                      <AddIcon fontSize="small" />
                      <Typography sx={{ ml: 1 }}>Add Users</Typography>
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}

            <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#D4AF37",
                  cursor: "pointer", 
                  "&:hover": { color: "#fff" }, 
                }}
                onClick={() => navigate("/")}
                >
                Airline
            </Typography>

          </Box>

          {/* Desktop navbar */}
          {!isMobile && (
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
                    color: location.pathname === "/flights/create" ? "#D4AF37" : "#fce69dff",
                    fontWeight: 600,
                    "&:hover": { bgcolor: "rgba(212,175,55,0.1)", color: "#D4AF37" },
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
                    color: location.pathname === "/baggage/create" ? "#D4AF37" : "#fce69dff",
                    fontWeight: 600,
                    "&:hover": { bgcolor: "rgba(212,175,55,0.1)", color: "#D4AF37" },
                    }}
                >
                    Add Baggage
                </Button>
                )}

                {isAdmin && (
                <Button
                    component={Link}
                    to="/admin/add-users"
                    startIcon={<AddIcon />}
                    sx={{
                    color: location.pathname === "/admin/add-users" ? "#D4AF37" : "#fce69dff",
                    fontWeight: 600,
                    "&:hover": { bgcolor: "rgba(212,175,55,0.1)", color: "#D4AF37" },
                    }}
                >
                    Add Users
                </Button>
                )}
            </Box>
          )}

          {/* Profile Menu & Bell Icon */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {!isTiny && (
              <Typography variant="body1" sx={{ fontWeight: 600, color: "#fff" }}>
                {user?.name}
              </Typography>
            )}

            {/* --- BELL ICON --- */}
            <IconButton 
                color="inherit" 
                onClick={() => setOpenNotifications(true)} // <-- Open NotificationBellModal
                sx={{ color: '#D4AF37' }} 
            >
                <NotificationsIcon />
            </IconButton>
            {/* --------------- */}

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar sx={{ bgcolor: "#D4AF37", color: "#1A1A2E", fontWeight: 700 }}>
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
                    "&:hover": {
                      bgcolor: "rgba(212,175,55,0.1)",
                      color: "#D4AF37",
                    },
                  },
                },
              }}
            >
              {isTiny && (
                <MenuItem disabled>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {user?.name}
                  </Typography>
                </MenuItem>
              )}

              <MenuItem>
                <Box>
                  <Typography variant="body2">{user?.email}</Typography>
                  <Typography variant="caption" sx={{ color: "#D4AF37", fontWeight: 600 }}>
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

              <MenuItem onClick={() => logout()} sx={{ color: "#ff4d4d", fontWeight: 600 }}>
                <LogoutIcon fontSize="small" style={{ marginRight: 8 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {/* This is the original real-time notification modal (still active for immediate pushes) */}
        <FlightNotification /> 
        <Outlet />
      </Box>

      <ProfileDialog open={openProfile} onClose={() => setOpenProfile(false)} user={user} />
      
      {/* --- NOTIFICATION HISTORY MODAL --- */}
      <NotificationBellModal 
          open={openNotifications} 
          onClose={() => setOpenNotifications(false)} // <-- Close handler for the modal
      />
      {/* ---------------------------------- */}
    </Box>
  );
}
