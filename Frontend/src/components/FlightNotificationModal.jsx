import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
  Box
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { socket } from "../services/socket";

export default function FlightNotificationModal() {
  const [queue, setQueue] = useState([]); // store flight updates
  const [current, setCurrent] = useState(null); // currently displayed flight
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = (event) => {
      setQueue((prev) => [...prev, event]);
    };

    // Listen to both channels (flightUpdate is the one likely broadcast by server)
    socket.on("flightUpdate", handleUpdate); 
    // We keep the manual listener just in case you use it later
    socket.on("flightUpdateManual", handleUpdate); 

    return () => {
      socket.off("flightUpdate", handleUpdate);
      socket.off("flightUpdateManual", handleUpdate); 
    };
  }, []);

  // Whenever queue has items and nothing is shown → show the first one
  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((prev) => prev.slice(1));
      setOpen(true);
    }
  }, [queue, current]);

  const handleClose = () => {
    setOpen(false);
    setCurrent(null);
  };

  if (!current) return null;

  const getBorderColor = (status) => {
    // We try to grab status from the current object or an 'updates' field if present
    const statusValue = status || current.status || current.updates?.status;

    switch (statusValue?.toLowerCase()) {
      case "delayed":
        return "4px solid orange";
      case "cancelled":
        return "4px solid red";
      default:
        return "2px solid gray";
    }
  };

  // REMOVED getNotificationMessage FUNCTION

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      // Use the robust status check in getBorderColor
      PaperProps={{
        sx: { border: getBorderColor(), borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Flight Update
        <IconButton edge="end" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* --- Static, Generic Message --- */}
        <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Hi all users,
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              There's some important <b>flight data updated</b>.
            </Typography>
            <Typography variant="body1">
              Please <b>refresh the dashboard</b> or <b>check notification</b> to see the latest changes.
            </Typography>
        </Box>
        
        {/* --- REMOVED Full Details Section --- 
             (Since the data is unreliable, showing the full details might confuse users) 
        */}
      </DialogContent>

      <DialogActions>
        {/* Optional: Add a button to force a page refresh, which loads the new data */}
        <Button variant="outlined" onClick={() => window.location.reload()}>Refresh Dashboard</Button>
        <Button variant="contained" onClick={handleClose}>Okay, I'll check it</Button>
      </DialogActions>
    </Dialog>
  );
}