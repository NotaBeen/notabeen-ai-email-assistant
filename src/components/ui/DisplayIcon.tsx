import { Box } from "@mui/material";
import React from "react";
import {
  BulbIcon,
  CodeIcon,
  EarIcon,
  EncryptionIcon,
  GDPRIcon,
  HeartIcon,
  InfinityIcon,
  MindIcon,
  ReadyIcon,
  SupportIcon,
  TrustIcon,
  UsersIcon,
  VerifiedIcon,
  WorkIcon,
} from "@/lib/SVGIcons";

const iconMap: { [key: string]: React.ReactNode } = {
  gdpr: <GDPRIcon />,
  encryption: <EncryptionIcon />,
  trust: <TrustIcon />,
  work: <WorkIcon />,
  support: <SupportIcon />,
  code: <CodeIcon />,
  ready: <ReadyIcon />,
  mind: <MindIcon />,
  users: <UsersIcon />,
  heart: <HeartIcon />,
  ear: <EarIcon />,
  bulb: <BulbIcon />,
  verified: <VerifiedIcon />,
  infinity: <InfinityIcon />,
};

export interface DisplayIconProps {
  icon: string;
}

export default function DisplayIcon({ icon }: DisplayIconProps) {
  return (
    <Box sx={{ display: "flex", color: "white" }}>{iconMap[icon] || null}</Box>
  );
}
