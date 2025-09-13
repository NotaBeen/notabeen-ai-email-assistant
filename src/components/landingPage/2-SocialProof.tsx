import React from "react";
import { Box, Container, Typography, Divider } from "@mui/material";

export default function SocialProof() {
  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <Divider sx={{ my: { xs: 3, md: 4 } }} />
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
            fontWeight: 600,
            fontStyle: "italic",
            mb: { xs: 3, md: 4 },
            color: "text.primary",
            lineHeight: 1.4,
          }}
        >
          I built NotaBeen because I was tired of feeling anxious about my
          inbox. It is for every professional who wants to stop being a slave to
          email and start focusing on the work that truly matters.
        </Typography>
        <Typography
          variant="h6"
          component="p"
          sx={{
            fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
            fontWeight: 500,
            color: "text.secondary",
            mt: 2,
          }}
        >
          — Curtis Thomas, Founder of NotaBeen
        </Typography>
        <Divider sx={{ my: { xs: 3, md: 4 } }} />
      </Container>
    </Box>
  );
}
