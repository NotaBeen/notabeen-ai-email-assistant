import { Box } from "@mui/material";
import React from "react";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import XIcon from "@mui/icons-material/X";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import { IconDataProps } from "@/types/interfaces";

export default function Icon({ icon }: IconDataProps) {
  switch (icon) {
    case "people":
      return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PersonOutlineIcon sx={{ fontSize: 28, color: "#0365e0" }} />
        </Box>
      );
    case "support":
      return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <VolunteerActivismIcon sx={{ fontSize: 25, color: "#0365e0" }} />
        </Box>
      );
    case "work":
      return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <WorkOutlineIcon sx={{ fontSize: 25, color: "#0365e0" }} />
        </Box>
      );
    case "LinkedIn":
      return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <LinkedInIcon sx={{ fontSize: 25, color: "#444444" }} />
        </Box>
      );
    case "X":
      return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <XIcon sx={{ fontSize: 21, color: "#444444" }} />
        </Box>
      );
    case "Instagram":
      return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <InstagramIcon sx={{ fontSize: 24, color: "#444444" }} />
        </Box>
      );
    case "Facebook":
      return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FacebookIcon sx={{ fontSize: 25, color: "#444444" }} />
        </Box>
      );

    default:
      return <Box></Box>;
  }
}
