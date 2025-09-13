import React from "react";
import { Box, Container, Typography } from "@mui/material";

export default function AudienceCallOut() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.default" }}>
      <Container
        maxWidth="md"
        sx={{
          textAlign: "center",
          p: { xs: 4, md: 6 },
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
            fontWeight: 800,
            mb: { xs: 2, md: 2 },
            color: "text.primary",
          }}
        >
          Built for Professionals Who Are Tired of Inbox Anxiety.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
            fontWeight: 400,
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          NotaBeen is for anyone who feels like their inbox is a full-time job.
          Stop sifting through clutter and start doing your real work.
        </Typography>
      </Container>
    </Box>
  );
}
