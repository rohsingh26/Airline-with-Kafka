import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

// Helper to format the time since the event occurred
const timeSince = (isoDate) => {
    const seconds = Math.floor((new Date() - new Date(isoDate)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

export default function NotificationBellModal({ open, onClose }) {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.listNotifications(token);
            // The data contains the full notification object including 'message'
            setNotifications(data);
        } catch (err) {
            setError("Failed to load notifications. Check network or permissions.");
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    // Load notifications only when the modal opens
    useEffect(() => {
        if (open) {
            loadNotifications();
        }
    }, [open, token]);

    const handleClose = () => {
        onClose();
        // Clear the state when closing for a fresh load next time
        setNotifications([]); 
        setError(null);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs" // Smaller width as requested (200px equivalent)
            fullWidth
            PaperProps={{
                sx: { 
                    height: '80vh', // 80% of screen height
                    bgcolor: '#f5f5f5', // Light background for contrast
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid #ddd' 
            }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Notifications
                </Typography>
                <IconButton onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, overflowY: 'auto' }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                )}
                {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
                
                {!loading && !error && notifications.length === 0 && (
                    <Typography sx={{ p: 3, textAlign: 'center', color: 'gray' }}>
                        No recent updates.
                    </Typography>
                )}

                <List disablePadding>
                    {notifications.map((n, index) => (
                        <ListItem 
                            key={index} 
                            divider 
                            sx={{ 
                                bgcolor: 'white', 
                                borderLeft: '4px solid #D4AF37', 
                                mb: '2px',
                                p: 1.5,
                            }}
                        >
                            <ListItemText 
                                primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Flight {n.flightNo || 'Unknown'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {timeSince(n.timestamp)}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <>
                                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                                            {n.message}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Gate: {n.gate || 'TBD'} | Status: {n.status.toUpperCase()}
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
}
