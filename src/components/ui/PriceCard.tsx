"use client";

import { PriceCardProps } from "@/types/interfaces";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

export default function PriceCard({ data }: PriceCardProps) {
  const currencySymbol = data.currency || "€";
  const displayedPrice = data.price.toFixed(2);

  return (
    <Card
      sx={{
        p: { xs: 1, sm: 2 },
        minHeight: "50vh",
        bgcolor: data.color.cardBgColor,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <CardContent sx={{ minHeight: { xs: "auto", md: "90%" } }}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontSize: 25,
              fontWeight: 600,
              textAlign: "center",
              textTransform: "capitalize",
            }}
          >
            {data.tier}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontSize: 35,
                fontWeight: 600,
                lineHeight: 1.7,
              }}
            >
              {currencySymbol}
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700 }}>
              {displayedPrice}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: 22,
                fontWeight: 500,

                lineHeight: 2.5,
              }}
            >
              /{data.duration}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              fontSize: 17.5,
              textAlign: "center",
              mt: 1,
              mb: 2,
              maxWidth: "280px",
              mx: "auto",
            }}
          >
            {data.description}
          </Typography>
        </Box>
        <Box sx={{ px: { xs: 0, sm: 1.5 } }}>
          {data.features.map((feature) => (
            <Box
              key={feature}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 0.5,
              }}
            >
              <TaskAltIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontSize: 15.5 }}>
                {feature}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
      <CardActions>
        <Button
          variant="outlined"
          sx={{
            width: "100%",
            backgroundColor: "#000000",
            color: "white",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: 1,
            border: "none",
          }}
          component="a"
          href={data.subscriptionLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {data.buttonText}
        </Button>
      </CardActions>
    </Card>
  );
}
