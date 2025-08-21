import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SecurityIcon from "@mui/icons-material/Security";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

const features = [
  {
    title: "Best Price Guarantee",
    desc: "Find the most competitive fares for your journey.",
    icon: <MonetizationOnIcon fontSize="large" color="primary" />,
  },
  {
    title: "Secure Booking",
    desc: "Your data is safe with our advanced security measures.",
    icon: <SecurityIcon fontSize="large" color="primary" />,
  },
  {
    title: "24/7 Support",
    desc: "Our team is always here to help you with any queries.",
    icon: <SupportAgentIcon fontSize="large" color="primary" />,
  },
];

export default function FeatureCards() {
  return (
    <Grid container spacing={3}>
      {features.map((f, idx) => (
        <Grid item xs={12} md={4} key={idx}>
          <Card sx={{ borderRadius: 3, textAlign: "center", p: 2 }}>
            <CardContent>
              {f.icon}
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                {f.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {f.desc}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
