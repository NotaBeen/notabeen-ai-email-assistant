// components/profile/ui/GdprInfoCard.tsx
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import {
  GDPRComplianceInformation,
  GDPRCategoryDetail,
  GDPRRecipient,
  GDPRRight,
} from "../ProfileTypes";

type Props = {
  gdprInfo: GDPRComplianceInformation;
};

// Helper function to render a single accordion section
const renderAccordion = (
  title: string,
  description: string,
  content:
    | GDPRComplianceInformation["purposes_of_processing"]
    | GDPRComplianceInformation["categories_of_personal_data"]
    | GDPRComplianceInformation["data_recipients"]
    | GDPRComplianceInformation["data_retention_policy"]
    | GDPRComplianceInformation["your_gdpr_rights"],
) => (
  <Accordion
    sx={{
      mb: 1,
      boxShadow: "none",
      border: "1px solid rgba(0,0,0,0.05)",
      borderRadius: "8px",
      "&:before": { display: "none" },
      "&.Mui-expanded": { m: 0 },
    }}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {description}
      </Typography>
      <List dense>
        {Object.entries(content).map(([key, value]) => {
          if (key === "_description") return null;

          // Check if the value is a nested object
          if (typeof value === "object" && value !== null) {
            // Special handling for nested structures like Categories and Rights
            if ("_details" in value) {
              const item = value as GDPRCategoryDetail | GDPRRight;
              return (
                <Box key={key}>
                  <ListItem disablePadding>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight="bold">
                          {key.replace(/_/g, " ")}:
                        </Typography>
                      }
                      secondary={item._details}
                      secondaryTypographyProps={{ variant: "caption", ml: 2 }}
                    />
                  </ListItem>
                  {/* Handle nested fields if they exist */}
                  {"fields" in item && Array.isArray(item.fields) && (
                    <List dense sx={{ pl: 2 }}>
                      {item.fields.map((field: string) => (
                        <ListItem key={field} disablePadding>
                          <ListItemIcon sx={{ minWidth: "30px" }}>
                            <KeyboardArrowRightIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={field}
                            primaryTypographyProps={{ variant: "body2" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                  {/* Handle 'how_to_exercise' if it exists */}
                  {"how_to_exercise" in item && (
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: "30px" }}>
                        <KeyboardArrowRightIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={"How to Exercise:"}
                        secondary={item.how_to_exercise}
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: "bold",
                        }}
                        secondaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  )}
                </Box>
              );
            }
            // Special handling for Data Recipients
            if ("name" in value) {
              const item = value as GDPRRecipient;
              return (
                <ListItem
                  key={key}
                  disablePadding
                  sx={{ flexDirection: "column", alignItems: "flex-start" }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight="bold">
                        {item.name}:
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{ ml: 2 }}
                        >
                          Purpose: {item.purpose}
                        </Typography>
                        <br />
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{ ml: 2 }}
                        >
                          Data Shared: {item.data_shared}
                        </Typography>
                      </>
                    }
                    secondaryTypographyProps={{ component: "div" }}
                  />
                </ListItem>
              );
            }
          }

          // Default case for simple key-value pairs
          return (
            <ListItem key={key} disablePadding>
              <ListItemIcon>
                <KeyboardArrowRightIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    component="span"
                    fontWeight="bold"
                  >
                    {key.replace(/_/g, " ")}:
                  </Typography>
                }
                secondary={value as string}
                secondaryTypographyProps={{ variant: "body2" }}
              />
            </ListItem>
          );
        })}
      </List>
    </AccordionDetails>
  </Accordion>
);

export function GdprInfoCard({ gdprInfo }: Props) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <CardContent>
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
              color: "primary.main",
            }}
          >
            <PrivacyTipIcon color="primary" /> GDPR Compliance Information
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {gdprInfo._note}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            For a more comprehensive understanding of our data processing
            practices, please refer to our full{" "}
            <a
              href="[Link to your Privacy Policy URL]"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "underline",
                color: "inherit",
              }}
            >
              <Box component="span" sx={{ color: "primary.main" }}>
                Privacy Policy
              </Box>
            </a>
            .
          </Typography>
          <Box sx={{ mt: 3 }}>
            {/* Render each accordion dynamically */}
            {renderAccordion(
              "1. Purposes of Processing",
              gdprInfo.purposes_of_processing._description,
              gdprInfo.purposes_of_processing,
            )}
            {renderAccordion(
              "2. Categories of Personal Data",
              gdprInfo.categories_of_personal_data._description,
              gdprInfo.categories_of_personal_data,
            )}
            {renderAccordion(
              "3. Data Recipients",
              gdprInfo.data_recipients._description,
              gdprInfo.data_recipients,
            )}
            {renderAccordion(
              "4. Data Retention Policy",
              gdprInfo.data_retention_policy._description,
              gdprInfo.data_retention_policy,
            )}
            {renderAccordion(
              "5. Your GDPR Rights",
              gdprInfo.your_gdpr_rights._description,
              gdprInfo.your_gdpr_rights,
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
