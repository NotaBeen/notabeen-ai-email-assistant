import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import ShieldIcon from "@mui/icons-material/Shield";

export default function SolutionIntroduction() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
            fontWeight: 800,
            textAlign: "center",
            mb: { xs: 4, md: 8 },
            color: "text.primary",
          }}
        >
          Meet NotaBeen: Your Personal Inbox Assistant
        </Typography>
        {/* Flexbox Container for Cards */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 4, md: 6 },
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          {/* Stop Sifting, Start Reading */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              flex: 1, // Allows the paper to grow and share space equally
              minWidth: { md: "250px" }, // Prevents cards from getting too small
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AutoStoriesIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                pb: 1,
                fontWeight: 700,
                color: "text.secondary",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              Stop Sifting, Start Reading
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              NotaBeen AI automatically sorts and prioritizes your emails,
              cutting through the noise so you only see what is important.
            </Typography>
          </Paper>

          {/* No More Inbox Anxiety */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              flex: 1,
              minWidth: { md: "250px" },
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
                display: "flex",
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
                pb: 1,
                fontWeight: 700,
                color: "text.secondary",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              No More Inbox Anxiety
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              With a clear, organized inbox, you can finally feel in control and
              stress-free.
            </Typography>
          </Paper>

          {/* Your Data, Your Way */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              flex: 1,
              minWidth: { md: "250px" },
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                pb: 1,
                fontWeight: 700,
                color: "text.secondary",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              Your Data, Your Way
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              Our privacy-first design ensures you control your data. Choose the
              open-source version to host on your own server for complete
              control, or opt for our hosted service for a one-time payment and
              powerful AI without the setup.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
