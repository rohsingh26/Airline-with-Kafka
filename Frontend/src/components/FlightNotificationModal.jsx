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

// Accept a new prop: onOpenNotificationsHistory
export default function FlightNotificationModal({ onOpenNotificationsHistory }) { 
  const [queue, setQueue] = useState([]); // store flight updates
  const [current, setCurrent] = useState(null); // currently displayed flight
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = (event) => {
      setQueue((prev) => [...prev, event]);
    };

    socket.on("flightUpdate", handleUpdate); 
    socket.on("flightUpdateManual", handleUpdate); 

    return () => {
      socket.off("flightUpdate", handleUpdate);
      socket.off("flightUpdateManual", handleUpdate); 
    };
  }, []);

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

  // New handler for "See Notifications" button
  const handleSeeNotificationsClick = () => {
    handleClose(); // First, close the current real-time notification modal
    if (onOpenNotificationsHistory) {
      onOpenNotificationsHistory(); // Then, tell the parent to open the history modal
    }
  };

  if (!current) return null;

  const getBorderColor = (status) => {
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

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
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
        <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Hi all users,
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              There's some important <b>flight data updated</b>.
            </Typography>
            <Typography variant="body1">
              Please <b>see notifications</b> or <b>refresh the dashboard</b> to check the latest changes.
            </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        {/* Changed button text and onClick handler */}
        <Button 
            variant="outlined" 
            onClick={handleSeeNotificationsClick}
        >
            See Notifications
        </Button>
        <Button variant="contained" onClick={handleClose}>Okay, I'll check it</Button>
      </DialogActions>
    </Dialog>
  );
}
