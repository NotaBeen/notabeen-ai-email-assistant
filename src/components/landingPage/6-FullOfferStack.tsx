import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"; // For Intelligent Prioritization
import ShieldIcon from "@mui/icons-material/Shield"; // For Complete Data Privacy
import SummarizeIcon from "@mui/icons-material/Summarize"; // For Automated Summaries

function FullOfferStack() {
  return (
    <Box sx={{ py: { xs: 6, md: 12 }, bgcolor: "background.paper" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 10 } }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              mb: 2,
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
            }}
          >
            Reclaim Your Inbox, Redefine Your Productivity.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              maxWidth: "800px",
              mx: "auto",
              color: "text.secondary",
              lineHeight: 1.6,
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            NotaBeen delivers a complete solution for professionals who want to
            move beyond email anxiety and get back to their real work. Here is
            everything you get.
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
          {/* Intelligent Prioritization */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              flex: "1 1 300px", // Enables flexible sizing
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
              <AutoFixHighIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: "text.secondary",
                fontSize: { xs: "1.2rem", md: "1.25rem" },
              }}
            >
              Intelligent Prioritization
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              Our AI learns what is important to you, automatically surfacing
              critical emails and archiving the rest. Never miss a key message
              again.
            </Typography>
          </Paper>

          {/* Complete Data Privacy */}
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
              <ShieldIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: "text.secondary",
                fontSize: { xs: "1.2rem", md: "1.25rem" },
              }}
            >
              Complete Data Privacy
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              You choose your privacy level. The self-hosted, open-source
              version means your data never leaves your server, while our hosted
              option provides a secure environment with enterprise-grade privacy
              standards.
            </Typography>
          </Paper>

          {/* Automated Summaries */}
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
              <SummarizeIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: "text.secondary",
                fontSize: { xs: "1.2rem", md: "1.25rem" },
              }}
            >
              Automated Summaries
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              Quickly get the gist of long email threads and newsletters with
              AI-powered summaries, saving you hours of reading time each week.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default FullOfferStack;
