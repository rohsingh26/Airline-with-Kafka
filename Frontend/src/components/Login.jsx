// src/pages/Login.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Email, Lock, Person } from "@mui/icons-material";
import f1 from "../assets/f1.jpg";
import f2 from "../assets/f2.jpg";
import f3 from "../assets/f3.jpg";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "passenger",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, register } = useAuth(); // 👈 use context methods
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password, form.role);
        await login(form.email, form.password); // auto login after signup
      } else {
        await login(form.email, form.password);
      }

      navigate("/"); // 👈 redirect after login
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        backgroundImage: `url(${f1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Main Box */}
      <Box
        sx={{
          display: "flex",
          width: "85%",
          maxWidth: 900,
          height: 550,
          borderRadius: "20px",
          overflow: "hidden",
          backgroundColor: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(6px)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        }}
      >
        {/* Left Side: Form */}
        <Box
          sx={{
            flex: 1,
            p: 5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Tabs */}
          <Tabs value={isRegister ? 1 : 0}>
            <Tab label="Login" onClick={() => setIsRegister(false)} />
            <Tab label="Sign Up" onClick={() => setIsRegister(true)} />
          </Tabs>

          <AnimatePresence mode="wait">
            {!isRegister ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h5" fontWeight="bold" mt={2} mb={2}>
                  Welcome to Airline
                </Typography>

                {error && (
                  <Typography color="error" variant="body2">
                    {error}
                  </Typography>
                )}

                <TextField
                  fullWidth
                  placeholder="Email"
                  margin="normal"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  placeholder="Password"
                  type="password"
                  margin="normal"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, py: 1.2, borderRadius: "25px" }}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h5" fontWeight="bold" mt={2} mb={2}>
                  Create Account
                </Typography>

                {error && (
                  <Typography color="error" variant="body2">
                    {error}
                  </Typography>
                )}

                <TextField
                  fullWidth
                  placeholder="Name"
                  margin="normal"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  placeholder="Email"
                  margin="normal"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  placeholder="Password"
                  type="password"
                  margin="normal"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Role Selector */}
                <TextField
                  select
                  fullWidth
                  margin="normal"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  label="Role"
                >
                  <MenuItem value="passenger">Passenger</MenuItem>
                </TextField>

                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, py: 1.2, borderRadius: "25px" }}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Signing up..." : "Sign Up"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* Right Side: Animated Image */}
        <Box sx={{ width: "50%", position: "relative" }}>
          <AnimatePresence mode="wait">
            {isRegister ? (
              <motion.img
                key="register-img"
                src={f3}
                alt="Register Illustration"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.6 }}
              />
            ) : (
              <motion.img
                key="login-img"
                src={f2}
                alt="Login Illustration"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
