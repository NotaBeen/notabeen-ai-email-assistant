import { Box, Paper, Typography } from "@mui/material";
import React from "react";
import DisplayIcon from "./DisplayIcon";

interface IconCardData {
  icon: string;
  value: string | number;
  label: string;
}

interface IconCardProps {
  data: IconCardData;
  orientation?: "left" | "center" | "right";
}

export default function IconCard({
  data,
  orientation = "left",
}: IconCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "solid 1px #313A4F",

        p: 2.5,
        height: "100%",
        textAlign: orientation,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          width: "100%",
          mb: 0.5,
        }}
      >
        <Box sx={{ lineHeight: 1 }}>
          <DisplayIcon icon={data.icon} />
        </Box>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: 18,
          }}
          gutterBottom
        >
          {data.value}
        </Typography>
      </Box>
      <Typography
        variant="body1"
        sx={{
          lineHeight: 1.5,
        }}
      >
        {data.label}
      </Typography>
    </Paper>
  );
}
