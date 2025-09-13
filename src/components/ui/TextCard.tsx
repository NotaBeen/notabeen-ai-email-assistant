import { Paper, Typography } from "@mui/material";
import React from "react";

export interface DataProps {
  data: {
    value: string;
    label: string;
    shrink: boolean;
    color?: string; // Make color optional
    list?: string[]; // Add optional list
    icon?: string; // Add optional icon
  };
}

export default function TextCard({ data }: DataProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "solid 1px #313A4F",
        p: 2,
        height: "100%",
        width: "100%",
      }}
    >
      {/* The rest of the component code remains the same */}
      {data.shrink ? (
        <Typography
          variant="h6"
          sx={{
            color: data.color,
            textAlign: "center",
            fontWeight: 600,
            mb: 0.8,
          }}
        >
          {data.value}
        </Typography>
      ) : (
        <Typography
          variant="h5"
          sx={{
            color: data.color,
            textAlign: "center",
            fontWeight: 600,
            mb: 0.5,
          }}
        >
          {data.value}
        </Typography>
      )}
      <Typography
        variant="body1"
        sx={{
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {data.label}
      </Typography>
    </Paper>
  );
}
