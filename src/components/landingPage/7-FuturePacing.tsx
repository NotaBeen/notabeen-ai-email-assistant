import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

function FuturePacing() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 10 } }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              mb: 2,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
            }}
          >
            Imagine Your Inbox, Transformed.
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              color: "text.secondary",
              maxWidth: "800px",
              mx: "auto",
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}
          >
            This is not just a vision. This is the future of your professional
            life, and it is powered by NotaBeen.
          </Typography>
        </Box>

        {/* Flexbox container for the three cards */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: { xs: 4, md: 6 },
            alignItems: "stretch",
          }}
        >
          {/* No more inbox anxiety. */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              flex: "1 1 300px",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderRadius: "50%",
                p: 2,
                mb: 2,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SentimentSatisfiedAltIcon
                sx={{ fontSize: { xs: 32, md: 40 } }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: "text.secondary",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              No more inbox anxiety.
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              You will feel calm, in control, and free from the stress of a
              cluttered inbox.
            </Typography>
          </Paper>

          {/* No more wasted hours. */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              flex: "1 1 300px",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderRadius: "50%",
                p: 2,
                mb: 2,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AccessTimeIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: "text.secondary",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              No more wasted hours.
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              You will spend more time on meaningful work and less time sifting
              through noise.
            </Typography>
          </Paper>

          {/* No more missed opportunities. */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              flex: "1 1 300px",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderRadius: "50%",
                p: 2,
                mb: 2,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrackChangesIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: "text.secondary",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              No more missed opportunities.
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              Your most important emails will be at the top, so you never miss a
              key message.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default FuturePacing;
